import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/roleGuard";
import type { AppEnv } from "../types";
import { ok, fail } from "../utils/response";

export const logisticsRouter = new Hono<AppEnv>();

type AuthUser = {
  user_id: string;
  role: string;
};

type SellerRow = {
  id: string;
};

function uid(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "")}`;
}

async function getSellerByOwnerUserId(env: AppEnv["Bindings"], ownerUserId: string) {
  const row = await env.DB.prepare(
    `select id
     from sellers
     where owner_user_id = ?
     limit 1`
  )
    .bind(ownerUserId)
    .first<SellerRow>();

  return row || null;
}

logisticsRouter.get(
  "/logistics/providers",
  authMiddleware,
  requireRole("seller", "admin"),
  async (c) => {
    try {
      const rows = await c.env.DB.prepare(
        `select
           lp.id,
           lp.code,
           lp.name,
           lp.logo_url,
           lp.website_url,
           lp.support_phone,
           lp.support_email,
           lp.is_active,
           lpm.id as method_id,
           lpm.code as method_code,
           lpm.name as method_name,
           lpm.description as method_description,
           lpm.estimated_min_days,
           lpm.estimated_max_days,
           lpm.is_active as method_is_active
         from logistics_providers lp
         left join logistics_provider_methods lpm
           on lpm.provider_id = lp.id
         where lp.is_active = 1
         order by lp.name asc, lpm.name asc`
      ).all<any>();

      const grouped = new Map<string, any>();

      for (const row of rows.results || []) {
        if (!grouped.has(row.id)) {
          grouped.set(row.id, {
            id: row.id,
            code: row.code,
            name: row.name,
            logo_url: row.logo_url,
            website_url: row.website_url,
            support_phone: row.support_phone,
            support_email: row.support_email,
            is_active: !!row.is_active,
            methods: [],
          });
        }

        if (row.method_id) {
          grouped.get(row.id).methods.push({
            id: row.method_id,
            code: row.method_code,
            name: row.method_name,
            description: row.method_description,
            estimated_min_days: row.estimated_min_days,
            estimated_max_days: row.estimated_max_days,
            is_active: !!row.method_is_active,
          });
        }
      }

      return c.json(ok(Array.from(grouped.values())));
    } catch (error) {
      console.error("GET /marketplace/logistics/providers failed:", error);
      return c.json(
        fail("LOGISTICS_PROVIDERS_FAILED", "Failed to load logistics providers"),
        500
      );
    }
  }
);

logisticsRouter.get(
  "/logistics/zones",
  authMiddleware,
  requireRole("seller", "admin"),
  async (c) => {
    try {
      const rows = await c.env.DB.prepare(
        `select
           z.id,
           z.code,
           z.name,
           z.country_code,
           z.is_active,
           c.id as city_id,
           c.city_name,
           c.city_code
         from shipping_zones z
         left join shipping_zone_cities c
           on c.zone_id = z.id
         where z.is_active = 1
         order by z.name asc, c.city_name asc`
      ).all<any>();

      const grouped = new Map<string, any>();

      for (const row of rows.results || []) {
        if (!grouped.has(row.id)) {
          grouped.set(row.id, {
            id: row.id,
            code: row.code,
            name: row.name,
            country_code: row.country_code,
            is_active: !!row.is_active,
            cities: [],
          });
        }

        if (row.city_id) {
          grouped.get(row.id).cities.push({
            id: row.city_id,
            name: row.city_name,
            code: row.city_code,
          });
        }
      }

      return c.json(ok(Array.from(grouped.values())));
    } catch (error) {
      console.error("GET /marketplace/logistics/zones failed:", error);
      return c.json(
        fail("LOGISTICS_ZONES_FAILED", "Failed to load shipping zones"),
        500
      );
    }
  }
);

logisticsRouter.get(
  "/logistics/settings",
  authMiddleware,
  requireRole("seller", "admin"),
  async (c) => {
    try {
      const authUser = c.get("authUser") as AuthUser;
      const seller = await getSellerByOwnerUserId(c.env, authUser.user_id);

      if (!seller && authUser.role !== "admin") {
        return c.json(fail("SELLER_NOT_FOUND", "Seller profile not found"), 404);
      }

      const sellerId = seller?.id || String(c.req.query("seller_id") || "").trim();

      if (!sellerId) {
        return c.json(fail("SELLER_ID_REQUIRED", "seller_id is required"), 400);
      }

      const rows = await c.env.DB.prepare(
        `select
           sla.id as seller_account_id,
           sla.provider_id,
           sla.account_label,
           sla.provider_account_code,
           sla.is_active as provider_enabled,
           lp.code as provider_code,
           lp.name as provider_name,
           slm.id as seller_method_id,
           slm.provider_method_id,
           slm.zone_id,
           slm.is_active as method_enabled,
           slm.price_type,
           slm.flat_price,
           slm.free_shipping_threshold,
           slm.min_order_value,
           slm.max_order_value,
           slm.handling_days,
           slm.cash_on_delivery_available,
           lpm.code as method_code,
           lpm.name as method_name,
           lpm.estimated_min_days,
           lpm.estimated_max_days,
           z.code as zone_code,
           z.name as zone_name
         from seller_logistics_accounts sla
         join logistics_providers lp
           on lp.id = sla.provider_id
         left join seller_logistics_methods slm
           on slm.seller_id = sla.seller_id
          and slm.provider_method_id in (
            select id
            from logistics_provider_methods
            where provider_id = sla.provider_id
          )
         left join logistics_provider_methods lpm
           on lpm.id = slm.provider_method_id
         left join shipping_zones z
           on z.id = slm.zone_id
         where sla.seller_id = ?
         order by lp.name asc, lpm.name asc, z.name asc`
      )
        .bind(sellerId)
        .all<any>();

      const grouped = new Map<string, any>();

      for (const row of rows.results || []) {
        if (!grouped.has(row.provider_id)) {
          grouped.set(row.provider_id, {
            seller_account_id: row.seller_account_id,
            provider_id: row.provider_id,
            provider_code: row.provider_code,
            provider_name: row.provider_name,
            provider_enabled: !!row.provider_enabled,
            account_label: row.account_label,
            provider_account_code: row.provider_account_code,
            methods: [],
          });
        }

        if (row.provider_method_id) {
          grouped.get(row.provider_id).methods.push({
            seller_method_id: row.seller_method_id,
            provider_method_id: row.provider_method_id,
            method_code: row.method_code,
            method_name: row.method_name,
            estimated_min_days: row.estimated_min_days,
            estimated_max_days: row.estimated_max_days,
            zone_id: row.zone_id,
            zone_code: row.zone_code,
            zone_name: row.zone_name,
            method_enabled: !!row.method_enabled,
            price_type: row.price_type,
            flat_price: row.flat_price,
            free_shipping_threshold: row.free_shipping_threshold,
            min_order_value: row.min_order_value,
            max_order_value: row.max_order_value,
            handling_days: row.handling_days,
            cash_on_delivery_available: !!row.cash_on_delivery_available,
          });
        }
      }

      return c.json(ok(Array.from(grouped.values())));
    } catch (error) {
      console.error("GET /marketplace/logistics/settings failed:", error);
      return c.json(
        fail("LOGISTICS_SETTINGS_FAILED", "Failed to load seller logistics settings"),
        500
      );
    }
  }
);

logisticsRouter.put(
  "/logistics/settings",
  authMiddleware,
  requireRole("seller", "admin"),
  async (c) => {
    try {
      const authUser = c.get("authUser") as AuthUser;
      const seller = await getSellerByOwnerUserId(c.env, authUser.user_id);

      if (!seller && authUser.role !== "admin") {
        return c.json(fail("SELLER_NOT_FOUND", "Seller profile not found"), 404);
      }

      const sellerId = seller?.id || String(c.req.query("seller_id") || "").trim();

      if (!sellerId) {
        return c.json(fail("SELLER_ID_REQUIRED", "seller_id is required"), 400);
      }

      const body = await c.req.json().catch(() => null);

      if (!body || !Array.isArray(body.providers)) {
        return c.json(fail("INVALID_BODY", "Body must contain providers array"), 400);
      }

      await c.env.DB.prepare(
        `delete from seller_logistics_methods where seller_id = ?`
      )
        .bind(sellerId)
        .run();

      await c.env.DB.prepare(
        `delete from seller_logistics_accounts where seller_id = ?`
      )
        .bind(sellerId)
        .run();

      for (const provider of body.providers) {
        if (!provider?.provider_id) continue;

        await c.env.DB.prepare(
          `insert into seller_logistics_accounts (
             id,
             seller_id,
             provider_id,
             account_label,
             provider_account_code,
             is_active,
             created_at,
             updated_at
           ) values (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
        )
          .bind(
            uid("sla"),
            sellerId,
            String(provider.provider_id),
            provider.account_label ? String(provider.account_label).trim() : null,
            provider.provider_account_code ? String(provider.provider_account_code).trim() : null,
            provider.provider_enabled ? 1 : 0
          )
          .run();

        if (!Array.isArray(provider.methods)) continue;

        for (const method of provider.methods) {
          if (!method?.provider_method_id || !method?.zone_id) continue;

          await c.env.DB.prepare(
            `insert into seller_logistics_methods (
               id,
               seller_id,
               provider_method_id,
               zone_id,
               is_active,
               price_type,
               flat_price,
               free_shipping_threshold,
               min_order_value,
               max_order_value,
               handling_days,
               cash_on_delivery_available,
               created_at,
               updated_at
             ) values (?, ?, ?, ?, ?, 'flat', ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
          )
            .bind(
              uid("slm"),
              sellerId,
              String(method.provider_method_id),
              String(method.zone_id),
              method.method_enabled ? 1 : 0,
              method.flat_price ?? null,
              method.free_shipping_threshold ?? null,
              method.min_order_value ?? null,
              method.max_order_value ?? null,
              Number(method.handling_days || 0),
              method.cash_on_delivery_available ? 1 : 0
            )
            .run();
        }
      }

      return c.json(ok({ saved: true }));
    } catch (error) {
      console.error("PUT /marketplace/logistics/settings failed:", error);
      return c.json(
        fail("LOGISTICS_SETTINGS_SAVE_FAILED", "Failed to save seller logistics settings"),
        500
      );
    }
  }
);

logisticsRouter.post("/logistics/resolve", async (c) => {
  try {
    const body = await c.req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return c.json(fail("INVALID_BODY", "Invalid JSON body"), 400);
    }

    const sellerId = String(body.seller_id || "").trim();
    const zoneCode = String(body.zone_code || "").trim().toLowerCase();
    const orderTotal = Number(body.order_total || 0);

    if (!sellerId) {
      return c.json(fail("SELLER_ID_REQUIRED", "seller_id is required"), 400);
    }

    if (!zoneCode) {
      return c.json(fail("ZONE_CODE_REQUIRED", "zone_code is required"), 400);
    }

    const rows = await c.env.DB.prepare(
      `select
         lp.id as provider_id,
         lp.code as provider_code,
         lp.name as provider_name,
         lpm.id as provider_method_id,
         lpm.code as method_code,
         lpm.name as method_name,
         lpm.estimated_min_days,
         lpm.estimated_max_days,
         slm.flat_price,
         slm.free_shipping_threshold,
         slm.min_order_value,
         slm.max_order_value,
         slm.handling_days,
         slm.cash_on_delivery_available,
         z.code as zone_code,
         z.name as zone_name
       from seller_logistics_methods slm
       join seller_logistics_accounts sla
         on sla.seller_id = slm.seller_id
       join logistics_provider_methods lpm
         on lpm.id = slm.provider_method_id
       join logistics_providers lp
         on lp.id = lpm.provider_id
       join shipping_zones z
         on z.id = slm.zone_id
       where slm.seller_id = ?
         and sla.provider_id = lp.id
         and sla.is_active = 1
         and slm.is_active = 1
         and (lower(z.code) = ? or lower(z.code) = 'all-ma')
       order by slm.flat_price asc, lp.name asc, lpm.name asc`
    )
      .bind(sellerId, zoneCode)
      .all<any>();

    const options = (rows.results || [])
      .filter((row: any) => {
        if (row.min_order_value != null && orderTotal < Number(row.min_order_value)) {
          return false;
        }
        if (row.max_order_value != null && orderTotal > Number(row.max_order_value)) {
          return false;
        }
        return true;
      })
      .map((row: any) => {
        const freeThreshold =
          row.free_shipping_threshold != null
            ? Number(row.free_shipping_threshold)
            : null;

        const shippingPrice =
          freeThreshold != null && orderTotal >= freeThreshold
            ? 0
            : Number(row.flat_price ?? 0);

        return {
          provider_id: row.provider_id,
          provider_code: row.provider_code,
          provider_name: row.provider_name,
          provider_method_id: row.provider_method_id,
          method_code: row.method_code,
          method_name: row.method_name,
          estimated_min_days: row.estimated_min_days,
          estimated_max_days: row.estimated_max_days,
          handling_days: row.handling_days,
          zone_code: row.zone_code,
          zone_name: row.zone_name,
          shipping_price: shippingPrice,
          free_shipping_threshold: freeThreshold,
          cash_on_delivery_available: !!row.cash_on_delivery_available,
        };
      });

    return c.json(ok(options));
  } catch (error) {
    console.error("POST /marketplace/logistics/resolve failed:", error);
    return c.json(fail("LOGISTICS_RESOLVE_FAILED", "Failed to resolve shipping options"), 500);
  }
});
