"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  MapPin,
  CreditCard,
  Truck,
  ShieldCheck,
  Check,
} from "lucide-react";
import { MobileHeader } from "@/components/marketplace/mobile-header";
import { TrustBadge } from "@/components/marketplace/trust-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn, formatPrice } from "@/lib/utils";

const orderItems = [
  {
    id: "1",
    name: "Pure Moroccan Argan Oil",
    price: 249,
    quantity: 2,
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=200&h=200&fit=crop",
  },
  {
    id: "2",
    name: "Handwoven Berber Wool Rug",
    price: 1890,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1600166898405-da9535204843?w=200&h=200&fit=crop",
  },
  {
    id: "3",
    name: "Premium Saffron Threads",
    price: 189,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=200&h=200&fit=crop",
  },
];

const shippingMethods = [
  {
    id: "standard",
    name: "Standard Delivery",
    description: "3-5 business days",
    price: 0,
    icon: Truck,
  },
  {
    id: "express",
    name: "Express Delivery",
    description: "1-2 business days",
    price: 45,
    icon: Truck,
  },
];

const paymentMethods = [
  {
    id: "cod",
    name: "Cash on Delivery",
    description: "Pay when you receive",
    icon: "cash",
  },
  {
    id: "card",
    name: "Credit / Debit Card",
    description: "Visa, Mastercard, CMI",
    icon: "card",
  },
];

type CheckoutStep = "shipping" | "payment" | "review";

export default function CheckoutPage() {
  const [step, setStep] = useState<CheckoutStep>("shipping");
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
  });

  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping =
    shippingMethods.find((m) => m.id === shippingMethod)?.price || 0;
  const total = subtotal + shipping;

  const steps: { id: CheckoutStep; label: string }[] = [
    { id: "shipping", label: "Shipping" },
    { id: "payment", label: "Payment" },
    { id: "review", label: "Review" },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === step);

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal Header */}
      <header className="border-b border-border/50 bg-background">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 lg:h-16 lg:px-6">
          <Link
            href="/cart"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Cart
          </Link>

          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="font-display text-lg font-bold text-primary-foreground">
                R
              </span>
            </div>
            <span className="font-display text-xl font-semibold">Rahba</span>
          </Link>

          <TrustBadge icon="secure" title="Secure" variant="inline" />
        </div>
      </header>

      <main className="pb-32 lg:pb-8">
        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-2 lg:gap-4">
              {steps.map((s, index) => (
                <div key={s.id} className="flex items-center gap-2 lg:gap-4">
                  <button
                    onClick={() => index < currentStepIndex && setStep(s.id)}
                    disabled={index > currentStepIndex}
                    className={cn(
                      "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
                      index === currentStepIndex
                        ? "bg-primary text-primary-foreground"
                        : index < currentStepIndex
                        ? "bg-accent/10 text-accent"
                        : "bg-secondary text-muted-foreground"
                    )}
                  >
                    {index < currentStepIndex ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-current/20 text-xs">
                        {index + 1}
                      </span>
                    )}
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "h-px w-8 lg:w-16",
                        index < currentStepIndex ? "bg-accent" : "bg-border"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:flex lg:gap-8">
            {/* Main Content */}
            <div className="flex-1">
              {/* Shipping Step */}
              {step === "shipping" && (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-soft">
                    <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                      <MapPin className="h-5 w-5 text-primary" />
                      Shipping Address
                    </h2>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium">First Name</label>
                        <Input
                          className="mt-1.5"
                          placeholder="Ahmed"
                          value={formData.firstName}
                          onChange={(e) =>
                            setFormData({ ...formData, firstName: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Last Name</label>
                        <Input
                          className="mt-1.5"
                          placeholder="Benali"
                          value={formData.lastName}
                          onChange={(e) =>
                            setFormData({ ...formData, lastName: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Phone</label>
                        <Input
                          className="mt-1.5"
                          placeholder="+212 6XX XXX XXX"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Email</label>
                        <Input
                          className="mt-1.5"
                          type="email"
                          placeholder="ahmed@example.com"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-sm font-medium">Address</label>
                        <Input
                          className="mt-1.5"
                          placeholder="123 Rue Mohammed V"
                          value={formData.address}
                          onChange={(e) =>
                            setFormData({ ...formData, address: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">City</label>
                        <Input
                          className="mt-1.5"
                          placeholder="Casablanca"
                          value={formData.city}
                          onChange={(e) =>
                            setFormData({ ...formData, city: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Postal Code</label>
                        <Input
                          className="mt-1.5"
                          placeholder="20000"
                          value={formData.postalCode}
                          onChange={(e) =>
                            setFormData({ ...formData, postalCode: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Shipping Method */}
                  <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-soft">
                    <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                      <Truck className="h-5 w-5 text-primary" />
                      Delivery Method
                    </h2>

                    <div className="mt-4 space-y-3">
                      {shippingMethods.map((method) => (
                        <label
                          key={method.id}
                          className={cn(
                            "flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all",
                            shippingMethod === method.id
                              ? "border-primary bg-primary/5"
                              : "border-border/50 hover:border-border"
                          )}
                        >
                          <div
                            className={cn(
                              "flex h-5 w-5 items-center justify-center rounded-full border-2",
                              shippingMethod === method.id
                                ? "border-primary bg-primary"
                                : "border-border"
                            )}
                          >
                            {shippingMethod === method.id && (
                              <Check className="h-3 w-3 text-primary-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{method.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {method.description}
                            </p>
                          </div>
                          <span className="font-semibold">
                            {method.price === 0 ? (
                              <span className="text-accent">Free</span>
                            ) : (
                              formatPrice(method.price)
                            )}
                          </span>
                          <input
                            type="radio"
                            name="shipping"
                            value={method.id}
                            checked={shippingMethod === method.id}
                            onChange={() => setShippingMethod(method.id)}
                            className="sr-only"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  <Button
                    size="xl"
                    className="w-full"
                    onClick={() => setStep("payment")}
                  >
                    Continue to Payment
                  </Button>
                </div>
              )}

              {/* Payment Step */}
              {step === "payment" && (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-soft">
                    <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                      <CreditCard className="h-5 w-5 text-primary" />
                      Payment Method
                    </h2>

                    <div className="mt-4 space-y-3">
                      {paymentMethods.map((method) => (
                        <label
                          key={method.id}
                          className={cn(
                            "flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all",
                            paymentMethod === method.id
                              ? "border-primary bg-primary/5"
                              : "border-border/50 hover:border-border"
                          )}
                        >
                          <div
                            className={cn(
                              "flex h-5 w-5 items-center justify-center rounded-full border-2",
                              paymentMethod === method.id
                                ? "border-primary bg-primary"
                                : "border-border"
                            )}
                          >
                            {paymentMethod === method.id && (
                              <Check className="h-3 w-3 text-primary-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{method.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {method.description}
                            </p>
                          </div>
                          <input
                            type="radio"
                            name="payment"
                            value={method.id}
                            checked={paymentMethod === method.id}
                            onChange={() => setPaymentMethod(method.id)}
                            className="sr-only"
                          />
                        </label>
                      ))}
                    </div>

                    {paymentMethod === "card" && (
                      <div className="mt-5 space-y-4 border-t border-border/50 pt-5">
                        <div>
                          <label className="text-sm font-medium">Card Number</label>
                          <Input
                            className="mt-1.5"
                            placeholder="1234 5678 9012 3456"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Expiry</label>
                            <Input className="mt-1.5" placeholder="MM/YY" />
                          </div>
                          <div>
                            <label className="text-sm font-medium">CVV</label>
                            <Input className="mt-1.5" placeholder="123" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    size="xl"
                    className="w-full"
                    onClick={() => setStep("review")}
                  >
                    Review Order
                  </Button>
                </div>
              )}

              {/* Review Step */}
              {step === "review" && (
                <div className="space-y-6">
                  {/* Shipping Info */}
                  <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-soft">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Shipping Address</h3>
                      <button
                        onClick={() => setStep("shipping")}
                        className="text-sm text-primary hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="mt-3 text-sm text-muted-foreground">
                      <p>
                        {formData.firstName || "Ahmed"} {formData.lastName || "Benali"}
                      </p>
                      <p>{formData.address || "123 Rue Mohammed V"}</p>
                      <p>
                        {formData.city || "Casablanca"},{" "}
                        {formData.postalCode || "20000"}
                      </p>
                      <p>{formData.phone || "+212 6XX XXX XXX"}</p>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-soft">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Payment Method</h3>
                      <button
                        onClick={() => setStep("payment")}
                        className="text-sm text-primary hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {paymentMethods.find((m) => m.id === paymentMethod)?.name}
                    </p>
                  </div>

                  {/* Order Items */}
                  <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-soft">
                    <h3 className="font-medium">Order Items</h3>
                    <div className="mt-4 space-y-3">
                      {orderItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-secondary">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                            <Badge
                              variant="secondary"
                              className="absolute -right-1 -top-1 h-5 w-5 justify-center rounded-full p-0 text-2xs"
                            >
                              {item.quantity}
                            </Badge>
                          </div>
                          <div className="flex-1 text-sm">
                            <p className="font-medium">{item.name}</p>
                          </div>
                          <p className="text-sm font-medium">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button size="xl" className="w-full">
                    Place Order - {formatPrice(total)}
                  </Button>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="mt-6 lg:mt-0 lg:w-96">
              <div className="sticky top-20 rounded-2xl border border-border/50 bg-card p-5 shadow-soft">
                <h2 className="font-display text-lg font-semibold">
                  Order Summary
                </h2>

                <div className="mt-4 space-y-3">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-secondary">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                        <Badge
                          variant="secondary"
                          className="absolute -right-1 -top-1 h-5 w-5 justify-center rounded-full p-0 text-2xs"
                        >
                          {item.quantity}
                        </Badge>
                      </div>
                      <div className="flex-1 text-sm">
                        <p className="line-clamp-1 font-medium">{item.name}</p>
                        <p className="text-muted-foreground">
                          {formatPrice(item.price)} x {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 space-y-2 border-t border-border/50 pt-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-accent">Free</span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-border/50 pt-3">
                    <span className="font-semibold">Total</span>
                    <span className="font-display text-xl font-semibold">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border/50 pt-5">
                  <TrustBadge icon="shield" title="Buyer Protection" variant="inline" />
                  <TrustBadge icon="return" title="Easy Returns" variant="inline" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sticky Footer */}
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/50 bg-background/95 p-4 backdrop-blur-lg lg:hidden">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="font-display text-xl font-semibold">
                {formatPrice(total)}
              </p>
            </div>
            <Button
              size="lg"
              className="flex-1"
              onClick={() => {
                if (step === "shipping") setStep("payment");
                else if (step === "payment") setStep("review");
                // else place order
              }}
            >
              {step === "review" ? "Place Order" : "Continue"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
