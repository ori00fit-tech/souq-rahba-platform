# Production Checklist

## Security
- [ ] Add Cloudflare WAF rules
- [ ] Add Cloudflare Access for admin
- [ ] Add secrets via `wrangler secret put`
- [ ] Add audit logging for seller approval and refund actions

## Commerce
- [ ] Implement real payment providers
- [ ] Implement seller payouts
- [ ] Implement invoice PDF generation
- [ ] Implement return labels and carrier adapters

## Compliance
- [ ] Privacy policy and cookie consent
- [ ] CNDP compliance workflow
- [ ] Terms for distance selling and returns
- [ ] Seller KYC review process

## Reliability
- [ ] Queue-driven notifications
- [ ] Error monitoring
- [ ] Smoke tests against deployed API
- [ ] Backup / migration strategy for D1 data
