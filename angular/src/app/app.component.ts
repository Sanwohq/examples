import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { createSanwo, type SanwoInstance } from '@sanwohq/web';
import type {
  SanwoProviderDefinition,
  CheckoutResult,
} from '@sanwohq/types';
import { paystackProvider } from '@sanwohq/paystack';
import { flutterwaveProvider } from '@sanwohq/flutterwave';
import { razorpayProvider } from '@sanwohq/razorpay';
import { monnifyProvider } from '@sanwohq/monnify';
import { interswitchProvider } from '@sanwohq/interswitch';
import { environment } from '../environments/environment';

export interface ScenarioConfig {
  id: string;
  label: string;
  description: string;
  group: string;
  provider: SanwoProviderDefinition;
  publicKey: string;
  currency: string;
  sanwoProviderOptions: Record<string, unknown>;
}

const SCENARIOS: ScenarioConfig[] = [
  // -- Paystack --
  {
    id: 'paystack-checkout',
    label: 'Paystack — Checkout',
    description: 'Standard Paystack checkout popup',
    group: 'Paystack',
    provider: paystackProvider,
    publicKey: environment.paystackPublicKey,
    currency: 'NGN',
    sanwoProviderOptions: { method: 'checkout' },
  },
  {
    id: 'paystack-new-transaction',
    label: 'Paystack — New Transaction',
    description: 'Paystack new transaction flow',
    group: 'Paystack',
    provider: paystackProvider,
    publicKey: environment.paystackPublicKey,
    currency: 'NGN',
    sanwoProviderOptions: { method: 'newTransaction' },
  },
  {
    id: 'paystack-card-only',
    label: 'Paystack — Card Only',
    description: 'Paystack checkout limited to card payments',
    group: 'Paystack',
    provider: paystackProvider,
    publicKey: environment.paystackPublicKey,
    currency: 'NGN',
    sanwoProviderOptions: { method: 'checkout', channels: ['card'] },
  },
  {
    id: 'paystack-bank-transfer',
    label: 'Paystack — Bank Transfer',
    description: 'Paystack checkout limited to bank transfer',
    group: 'Paystack',
    provider: paystackProvider,
    publicKey: environment.paystackPublicKey,
    currency: 'NGN',
    sanwoProviderOptions: { method: 'checkout', channels: ['bank_transfer'] },
  },

  // -- Flutterwave --
  {
    id: 'flutterwave-standard',
    label: 'Flutterwave — Standard',
    description: 'Standard Flutterwave checkout',
    group: 'Flutterwave',
    provider: flutterwaveProvider,
    publicKey: environment.flutterwavePublicKey,
    currency: 'NGN',
    sanwoProviderOptions: {},
  },
  {
    id: 'flutterwave-card-only',
    label: 'Flutterwave — Card Only',
    description: 'Flutterwave checkout limited to card payments',
    group: 'Flutterwave',
    provider: flutterwaveProvider,
    publicKey: environment.flutterwavePublicKey,
    currency: 'NGN',
    sanwoProviderOptions: { paymentOptions: 'card' },
  },

  // -- Razorpay --
  {
    id: 'razorpay-standard',
    label: 'Razorpay — Standard',
    description: 'Standard Razorpay checkout',
    group: 'Razorpay',
    provider: razorpayProvider,
    publicKey: environment.razorpayKeyId,
    currency: 'INR',
    sanwoProviderOptions: {},
  },

  // -- Monnify --
  {
    id: 'monnify-standard',
    label: 'Monnify — Standard',
    description: 'Standard Monnify checkout',
    group: 'Monnify',
    provider: monnifyProvider,
    publicKey: environment.monnifyApiKey,
    currency: 'NGN',
    sanwoProviderOptions: {
      contractCode: environment.monnifyContractCode,
      isTestMode: true,
    },
  },
  {
    id: 'monnify-card-only',
    label: 'Monnify — Card Only',
    description: 'Monnify checkout limited to card payments',
    group: 'Monnify',
    provider: monnifyProvider,
    publicKey: environment.monnifyApiKey,
    currency: 'NGN',
    sanwoProviderOptions: {
      contractCode: environment.monnifyContractCode,
      isTestMode: true,
      paymentMethods: ['CARD'],
    },
  },
  {
    id: 'monnify-bank-transfer',
    label: 'Monnify — Bank Transfer Only',
    description: 'Monnify checkout limited to bank transfer',
    group: 'Monnify',
    provider: monnifyProvider,
    publicKey: environment.monnifyApiKey,
    currency: 'NGN',
    sanwoProviderOptions: {
      contractCode: environment.monnifyContractCode,
      isTestMode: true,
      paymentMethods: ['ACCOUNT_TRANSFER'],
    },
  },

  // -- Interswitch --
  {
    id: 'interswitch-standard',
    label: 'Interswitch — Standard',
    description: 'Standard Interswitch checkout',
    group: 'Interswitch',
    provider: interswitchProvider,
    publicKey: environment.interswitchMerchantCode,
    currency: 'NGN',
    sanwoProviderOptions: {
      payItemId: environment.interswitchPayItemId,
      siteRedirectUrl: typeof window !== 'undefined' ? window.location.href : '',
    },
  },
];

interface ScenarioGroup {
  group: string;
  items: ScenarioConfig[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Result View -->
    <div class="card" *ngIf="result">
      <div [ngSwitch]="result.status">
        <div *ngSwitchCase="'successful'" class="success-box">
          <h2 class="result-title">Payment Successful</h2>
          <p>Reference: {{ result.reference }}</p>
          <p *ngIf="asSuccessful(result)?.transactionId">
            Transaction ID: {{ asSuccessful(result)?.transactionId }}
          </p>
        </div>
        <div *ngSwitchCase="'cancelled'" class="warning-box">
          <h2 class="result-title">Payment Cancelled</h2>
          <p>The payment was cancelled by the user.</p>
        </div>
        <div *ngSwitchCase="'failed'" class="error-box">
          <h2 class="result-title">Payment Failed</h2>
          <p>{{ asFailed(result)?.error?.message }}</p>
        </div>
        <div *ngSwitchCase="'pending'" class="warning-box">
          <h2 class="result-title">Payment Pending</h2>
          <p>The payment is being processed.</p>
        </div>
      </div>
      <button class="secondary-button" (click)="resetResult()">
        Make another payment
      </button>
    </div>

    <!-- Checkout Form -->
    <div class="card" *ngIf="!result">
      <h1 class="title">Sanwo Checkout</h1>
      <p class="subtitle">Angular example &mdash; {{ selected.group }}</p>

      <form class="form" (ngSubmit)="handleSubmit()">
        <div class="field">
          <label for="scenario">Payment Scenario</label>
          <select
            id="scenario"
            class="select"
            [(ngModel)]="selectedId"
            name="scenario"
            (ngModelChange)="onScenarioChange($event)"
          >
            <optgroup *ngFor="let group of groups" [label]="group.group">
              <option *ngFor="let s of group.items" [value]="s.id">
                {{ s.label }}
              </option>
            </optgroup>
          </select>
          <span class="hint">{{ selected.description }}</span>
        </div>

        <div class="field">
          <label for="email">Email</label>
          <input
            id="email"
            type="email"
            required
            placeholder="customer@example.com"
            class="input"
            [(ngModel)]="email"
            name="email"
          />
        </div>

        <div class="field">
          <label for="amount">Amount ({{ selected.currency }})</label>
          <input
            id="amount"
            type="number"
            required
            min="1"
            step="0.01"
            placeholder="1000.00"
            class="input"
            [(ngModel)]="amount"
            name="amount"
          />
        </div>

        <button
          type="submit"
          class="button"
          [disabled]="isLoading"
        >
          {{ isLoading ? 'Processing...' : 'Pay with ' + selected.group }}
        </button>
      </form>

      <div class="error-box" *ngIf="error">
        <strong>Error:</strong> {{ error }}
      </div>
    </div>
  `,
})
export class AppComponent implements OnDestroy {
  scenarios = SCENARIOS;
  selectedId = SCENARIOS[0].id;
  selected: ScenarioConfig = SCENARIOS[0];
  groups: ScenarioGroup[] = [];

  email = '';
  amount = '';
  isLoading = false;
  error: string | null = null;
  result: CheckoutResult | null = null;

  private sanwoInstance: SanwoInstance | null = null;

  constructor() {
    this.groups = this.buildGroups();
    this.rebuildInstance();
  }

  ngOnDestroy(): void {
    if (this.sanwoInstance) {
      this.sanwoInstance.destroy();
    }
  }

  onScenarioChange(id: string): void {
    this.selected = this.scenarios.find((s) => s.id === id) ?? this.scenarios[0];
    this.error = null;
    this.rebuildInstance();
  }

  async handleSubmit(): Promise<void> {
    if (this.isLoading || !this.sanwoInstance) return;

    const numericAmount = parseFloat(this.amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      this.error = 'Please enter a valid amount.';
      return;
    }

    const checkoutAmount = Math.round(numericAmount * 100);
    this.isLoading = true;
    this.error = null;

    try {
      this.result = await this.sanwoInstance({
        amount: checkoutAmount,
        currency: this.selected.currency,
        customer: { email: this.email },
        description: 'Sanwo example payment',
        onLoad: () => console.log('Sanwo: checkout loaded'),
        onError: (err) => console.log('Sanwo: checkout error', err),
        sanwoProviderOptions: this.selected.sanwoProviderOptions,
      });
    } catch (err) {
      this.error = err instanceof Error ? err.message : String(err);
    } finally {
      this.isLoading = false;
    }
  }

  resetResult(): void {
    this.result = null;
    this.email = '';
    this.amount = '';
  }

  asSuccessful(result: CheckoutResult | null) {
    return result?.status === 'successful' ? result : null;
  }

  asFailed(result: CheckoutResult | null) {
    return result?.status === 'failed' ? result : null;
  }

  private rebuildInstance(): void {
    if (this.sanwoInstance) {
      this.sanwoInstance.destroy();
    }
    this.sanwoInstance = createSanwo({
      provider: this.selected.provider,
      publicKey: this.selected.publicKey,
      containerId: 'sanwo-container',
    });
  }

  private buildGroups(): ScenarioGroup[] {
    const map = new Map<string, ScenarioConfig[]>();
    for (const s of this.scenarios) {
      const list = map.get(s.group) ?? [];
      list.push(s);
      map.set(s.group, list);
    }
    return Array.from(map.entries()).map(([group, items]) => ({
      group,
      items,
    }));
  }
}
