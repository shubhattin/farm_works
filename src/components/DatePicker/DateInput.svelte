<script lang="ts">
  import { fly } from 'svelte/transition';
  import { cubicInOut } from 'svelte/easing';
  import { toText } from './date-utils.js';
  import type { Locale } from './locale.js';
  import { parse, createFormat, type FormatToken } from './parse.js';
  import DateTimePicker from './DatePicker.svelte';
  import { writable } from 'svelte/store';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    select: Date;
  }>();

  const defaultDate = new Date();

  function cloneDate(d: Date) {
    return new Date(d.getTime());
  }

  const innerStore = writable(null as Date | null);
  const store = (() => {
    return {
      subscribe: innerStore.subscribe,
      set: (date: Date | null) => {
        if (date === null || date === undefined) {
          innerStore.set(null);
          value = date;
        } else if (date.getTime() !== $innerStore?.getTime()) {
          innerStore.set(cloneDate(date));
          value = date;
        }
      }
    };
  })();

  export let value: Date | null = null;
  $: store.set(value);

  export let min = new Date(defaultDate.getFullYear() - 20, 0, 1);
  export let max = new Date(defaultDate.getFullYear(), 11, 31, 23, 59, 59, 999);
  export let id: string | null = null;
  export let placeholder = '2020-12-31 23:00:00';
  export let valid = true;
  export let disabled = false;
  export let required = false;
  let classes = '';
  export { classes as class };

  export let locale: Locale = {};
  export let format = 'yyyy-MM-dd HH:mm:ss';
  let formatTokens = createFormat(format, locale);
  $: formatTokens = createFormat(format, locale);

  function valueUpdate(value: Date | null, formatTokens: FormatToken[]) {
    text = toText(value, formatTokens);
  }
  $: valueUpdate($store, formatTokens);

  export let text = toText($store, formatTokens);

  function textUpdate(text: string, formatTokens: FormatToken[]) {
    if (text.length) {
      const result = parse(text, formatTokens, $store);
      if (result.date !== null) {
        valid = true;
        store.set(result.date);
      } else {
        valid = false;
      }
    } else {
      valid = true;
      if (value) {
        value = null;
        store.set(null);
      }
    }
  }
  $: textUpdate(text, formatTokens);

  export let visible = false;
  export let closeOnSelection = false;
  export let browseWithoutSelecting = false;
  export let timePrecision: 'minute' | 'second' | 'millisecond' | null = null;

  let ignoreNextFocus = false;

  function onFocusOut(e: FocusEvent) {
    if (
      e?.currentTarget instanceof HTMLElement &&
      e.relatedTarget &&
      e.relatedTarget instanceof Node &&
      e.currentTarget.contains(e.relatedTarget)
    ) {
      return;
    } else {
      visible = false;
    }
  }

  function keydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && visible) {
      visible = false;
      e.preventDefault();
      e.stopPropagation();
    } else if (e.key === 'Enter') {
      visible = !visible;
      e.preventDefault();
    }
  }

  function handleFocus() {
    if (!ignoreNextFocus) {
      visible = true;
    }
  }

  function onSelect(e: CustomEvent<Date>) {
    dispatch('select', e.detail);
    if (closeOnSelection) {
      ignoreNextFocus = true;
      visible = false;
      setTimeout(() => {
        ignoreNextFocus = false;
      }, 100);
    }
  }

  export let dynamicPositioning = false;

  let InputElement: HTMLInputElement;
  let pickerElement: HTMLElement | null;
  let showAbove = false;
  let pickerLeftPosition: number | null = null;

  function setDatePickerPosition() {
    showAbove = false;
    pickerLeftPosition = null;

    if (visible && pickerElement && dynamicPositioning) {
      const inputRect = InputElement.getBoundingClientRect();
      const horizontalOverflow = pickerElement.offsetWidth - inputRect.width;

      const bottomThreshold = inputRect.bottom + pickerElement.offsetHeight + 5;
      const rightThreshold = inputRect.left + pickerElement.offsetWidth + 5;

      if (bottomThreshold > window.innerHeight) {
        showAbove = true;
      }
      if (rightThreshold > window.innerWidth) {
        pickerLeftPosition = -horizontalOverflow;

        if (inputRect.left < horizontalOverflow + 5) {
          const windowCenterPos = window.innerWidth / 2;
          const newPos = windowCenterPos - pickerElement.offsetWidth / 2;
          pickerLeftPosition = newPos - inputRect.left;
        }
      }
    }
  }

  function flyAutoPosition(node: HTMLElement) {
    setDatePickerPosition();
    return fly(node, {
      duration: 200,
      easing: cubicInOut,
      y: showAbove ? 5 : -5
    });
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="relative {classes}" on:focusout={onFocusOut} on:keydown={keydown}>
  <input
    bind:this={InputElement}
    class="input m-0 box-border w-[150px] min-w-0 rounded-xl
           border border-gray-300/30
           px-2 py-1 outline-hidden
           transition-all duration-75 ease-in-out
           focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40
           disabled:opacity-50
           {!valid
      ? 'border-red-400/50 bg-red-50/10 focus:border-red-500 focus:ring-2 focus:ring-red-500/50'
      : ''}"
    type="text"
    autocomplete="off"
    value={text}
    {id}
    {placeholder}
    {disabled}
    {required}
    on:focus={handleFocus}
    on:mousedown={() => !ignoreNextFocus && (visible = true)}
    on:input={(e) => {
      if (
        e instanceof InputEvent &&
        e.inputType === 'insertText' &&
        typeof e.data === 'string' &&
        e.currentTarget.value === text + e.data
      ) {
        let result = parse(text, formatTokens, $store);
        if (result.missingPunctuation !== '' && !result.missingPunctuation.startsWith(e.data)) {
          text = text + result.missingPunctuation + e.data;
          return;
        }
      }
      text = e.currentTarget.value;
    }}
  />

  {#if visible && !disabled}
    <div
      class="absolute z-10 hidden p-px
             {showAbove ? 'bottom-full' : ''}
             {visible ? 'block!' : ''}"
      bind:this={pickerElement}
      transition:flyAutoPosition
      style="left: {pickerLeftPosition}px"
    >
      <DateTimePicker
        on:focusout={onFocusOut}
        on:select={onSelect}
        bind:value={$store}
        {min}
        {max}
        {locale}
        {browseWithoutSelecting}
        {timePrecision}
      >
        <slot />
      </DateTimePicker>
    </div>
  {/if}
</div>
