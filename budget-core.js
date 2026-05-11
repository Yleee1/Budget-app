(function (global) {
  const DEFAULT_CONFIG = {
    storageKey: "entry_list",
    entryTypes: {
      income: "income",
      expense: "expense",
    },
    validation: {
      maxTitleLength: 50,
    },
  };

  const DEFAULT_MESSAGES = {
    titleRequired: "Please enter a title.",
    titleTooLong: (max) => `Title must be ${max} characters or fewer.`,
    invalidAmount: "Please enter an amount greater than 0.",
  };

  function defaultGenerateEntryId() {
    if (global.crypto && typeof global.crypto.randomUUID === "function") {
      return global.crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function validateEntry(title, amount, options) {
    const config = options?.config || DEFAULT_CONFIG;
    const messages = options?.messages || DEFAULT_MESSAGES;
    const trimmedTitle = String(title || "").trim();
    const parsedAmount = Number(amount);

    if (!trimmedTitle) {
      return { isValid: false, message: messages.titleRequired };
    }

    if (trimmedTitle.length > config.validation.maxTitleLength) {
      return {
        isValid: false,
        message:
          typeof messages.titleTooLong === "function"
            ? messages.titleTooLong(config.validation.maxTitleLength)
            : messages.titleTooLong,
      };
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return { isValid: false, message: messages.invalidAmount };
    }

    return {
      isValid: true,
      entry: {
        title: trimmedTitle,
        amount: parsedAmount,
      },
    };
  }

  function normalizeStoredEntry(entry, options) {
    const config = options?.config || DEFAULT_CONFIG;
    const createId = options?.createId || defaultGenerateEntryId;
    const messages = options?.messages || DEFAULT_MESSAGES;

    if (!entry || typeof entry !== "object") return null;
    if (!Object.values(config.entryTypes).includes(entry.type)) return null;

    const validation = validateEntry(entry.title, entry.amount, {
      config,
      messages,
    });

    if (!validation.isValid) return null;

    return {
      id: typeof entry.id === "string" && entry.id ? entry.id : createId(),
      type: entry.type,
      title: validation.entry.title,
      amount: validation.entry.amount,
    };
  }

  function loadEntries(options) {
    const storage = options?.storage || global.localStorage;
    const storageKey = options?.storageKey || DEFAULT_CONFIG.storageKey;
    const config = options?.config || DEFAULT_CONFIG;
    const createId = options?.createId || defaultGenerateEntryId;
    const messages = options?.messages || DEFAULT_MESSAGES;
    const onError = options?.onError || function () {};

    try {
      const storedEntries = storage.getItem(storageKey);
      if (!storedEntries) return [];

      const parsedEntries = JSON.parse(storedEntries);
      if (!Array.isArray(parsedEntries)) {
        throw new Error("Stored entries are not an array.");
      }

      return parsedEntries
        .map((entry) =>
          normalizeStoredEntry(entry, {
            config,
            createId,
            messages,
          })
        )
        .filter(Boolean);
    } catch (error) {
      onError(error);
      try {
        storage.removeItem(storageKey);
      } catch (removeError) {
        onError(removeError);
      }
      return [];
    }
  }

  function calculateTotal(type, list) {
    return list.reduce((sum, entry) => {
      if (entry.type === type) {
        return sum + entry.amount;
      }
      return sum;
    }, 0);
  }

  function calculateBalance(income, outcome) {
    return income - outcome;
  }

  const api = {
    DEFAULT_CONFIG,
    DEFAULT_MESSAGES,
    validateEntry,
    normalizeStoredEntry,
    loadEntries,
    calculateTotal,
    calculateBalance,
    defaultGenerateEntryId,
  };

  global.BudgetCore = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
