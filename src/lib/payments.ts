import type { PaymentMethodId } from "@/types";

/**
 * Payment provider abstraction. The browser NEVER sees or stores card numbers:
 * production implementations create a hosted checkout / PaymentIntent on the
 * server and redirect or mount the provider's own secure fields.
 */
export type PaymentIntentResult = {
  provider: "demo" | "stripe";
  intentId: string;
  clientSecret?: string;
  demo: boolean;
};

export const paymentMethods: {
  id: PaymentMethodId;
  label: { en: string; zh: string };
  hint: { en: string; zh: string };
}[] = [
  { id: "card", label: { en: "Credit / debit card", zh: "信用卡／扣賬卡" }, hint: { en: "Visa, Mastercard, UnionPay via provider-hosted fields", zh: "經支付平台安全欄位處理" } },
  { id: "fps", label: { en: "FPS (轉數快)", zh: "轉數快 FPS" }, hint: { en: "Bank transfer via QR code", zh: "透過二維碼轉賬" } },
  { id: "alipayhk", label: { en: "AlipayHK", zh: "支付寶香港" }, hint: { en: "Pay with the AlipayHK app", zh: "使用支付寶香港應用程式付款" } },
  { id: "wechat", label: { en: "WeChat Pay HK", zh: "微信支付香港" }, hint: { en: "Pay with WeChat Pay HK", zh: "使用微信支付香港付款" } },
];

export async function createDemoIntent(amountHKD: number, method: PaymentMethodId): Promise<PaymentIntentResult> {
  void amountHKD;
  void method;
  return { provider: "demo", intentId: `demo_pi_${Math.random().toString(36).slice(2, 10)}`, demo: true };
}
