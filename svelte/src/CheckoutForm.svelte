<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { createSanwoContext, createSanwoCheckout } from "@sanwohq/svelte";
  import type { ScenarioConfig } from "./App.svelte";

  export let scenarios: ScenarioConfig[];
  export let selectedId: string;
  export let selected: ScenarioConfig;

  const dispatch = createEventDispatcher<{ scenarioChange: string }>();

  // Create the Sanwo context for this scenario
  createSanwoContext({
    provider: selected.provider,
    publicKey: selected.publicKey,
    containerId: "sanwo-container",
  });

  // Create the checkout store
  const checkoutStore = createSanwoCheckout();

  let email = "";
  let amount = "";

  // Group scenarios by provider for <optgroup> rendering
  $: groups = (() => {
    const map = new Map<string, ScenarioConfig[]>();
    for (const s of scenarios) {
      const list = map.get(s.group) ?? [];
      list.push(s);
      map.set(s.group, list);
    }
    return Array.from(map.entries());
  })();

  async function handleSubmit() {
    const numericAmount = parseFloat(amount);
    const checkoutAmount = Math.round(numericAmount * 100);

    try {
      await checkoutStore.checkout({
        amount: checkoutAmount,
        currency: selected.currency,
        customer: { email },
        description: "Sanwo example payment",
        onLoad: () => console.log("Sanwo: checkout loaded"),
        onError: (err) => console.log("Sanwo: checkout error", err),
        sanwoProviderOptions: selected.sanwoProviderOptions,
      });
    } catch {
      // Error is captured in the store's error state
    }
  }

  function handleReset() {
    checkoutStore.reset();
    email = "";
    amount = "";
  }

  function handleScenarioChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    dispatch("scenarioChange", target.value);
  }
</script>

{#if $checkoutStore.result}
  <div class="card">
    {#if $checkoutStore.result.status === "successful"}
      <div class="success-box">
        <h2 class="result-title">Payment Successful</h2>
        <p>Reference: {$checkoutStore.result.reference}</p>
        {#if $checkoutStore.result.transactionId}
          <p>Transaction ID: {$checkoutStore.result.transactionId}</p>
        {/if}
      </div>
    {:else if $checkoutStore.result.status === "cancelled"}
      <div class="warning-box">
        <h2 class="result-title">Payment Cancelled</h2>
        <p>The payment was cancelled by the user.</p>
      </div>
    {:else if $checkoutStore.result.status === "failed"}
      <div class="error-box">
        <h2 class="result-title">Payment Failed</h2>
        <p>{$checkoutStore.result.error.message}</p>
      </div>
    {:else if $checkoutStore.result.status === "pending"}
      <div class="warning-box">
        <h2 class="result-title">Payment Pending</h2>
        <p>The payment is being processed.</p>
      </div>
    {/if}

    <button class="secondary-button" on:click={handleReset}>
      Make another payment
    </button>
  </div>
{:else}
  <div class="card">
    <h1 class="title">Sanwo Checkout</h1>
    <p class="subtitle">Svelte example &mdash; {selected.group}</p>

    <form class="form" on:submit|preventDefault={handleSubmit}>
      <div class="field">
        <label class="label" for="scenario">Payment Scenario</label>
        <select
          id="scenario"
          class="select"
          value={selectedId}
          on:change={handleScenarioChange}
        >
          {#each groups as [group, items]}
            <optgroup label={group}>
              {#each items as s}
                <option value={s.id}>{s.label}</option>
              {/each}
            </optgroup>
          {/each}
        </select>
        <span class="hint">{selected.description}</span>
      </div>

      <div class="field">
        <label class="label" for="email">Email</label>
        <input
          id="email"
          class="input"
          type="email"
          required
          placeholder="customer@example.com"
          bind:value={email}
        />
      </div>

      <div class="field">
        <label class="label" for="amount">Amount ({selected.currency})</label>
        <input
          id="amount"
          class="input"
          type="number"
          required
          min="1"
          step="0.01"
          placeholder="1000.00"
          bind:value={amount}
        />
      </div>

      <button
        type="submit"
        class="button"
        disabled={$checkoutStore.isLoading}
      >
        {$checkoutStore.isLoading ? "Processing..." : `Pay with ${selected.group}`}
      </button>
    </form>

    {#if $checkoutStore.error}
      <div class="error-box">
        <strong>Error:</strong> {$checkoutStore.error.message}
      </div>
    {/if}
  </div>
{/if}
