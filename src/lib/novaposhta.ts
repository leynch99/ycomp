/**
 * Nova Poshta API integration
 * Enhanced with TTN creation and tracking
 *
 * Setup:
 * 1. Register at https://novaposhta.ua
 * 2. Get API key from personal cabinet
 * 3. Set NP_API_KEY in .env
 * 4. Set NP_SENDER_REF (your warehouse/counterparty ref)
 */

const NP_API = "https://api.novaposhta.ua/v2.0/json/";

interface NpApiResponse<T> {
  success: boolean;
  data: T;
  errors?: string[];
  warnings?: string[];
}

/**
 * Make Nova Poshta API request
 */
async function npApiRequest<T>(
  modelName: string,
  calledMethod: string,
  methodProperties: Record<string, unknown>
): Promise<NpApiResponse<T>> {
  const apiKey = process.env.NP_API_KEY;
  if (!apiKey) {
    throw new Error("NP_API_KEY not configured");
  }

  const response = await fetch(NP_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apiKey,
      modelName,
      calledMethod,
      methodProperties,
    }),
  });

  return response.json();
}

/**
 * Search cities
 */
export async function searchCities(query: string, limit = 10) {
  const result = await npApiRequest<Array<{ Addresses: Array<{ DeliveryCity: string; Present: string; MainDescription: string; Ref: string }> }>>(
    "Address",
    "searchSettlements",
    { CityName: query, Limit: String(limit), Page: "1" }
  );

  if (!result.success || !result.data?.[0]?.Addresses) {
    return [];
  }

  return result.data[0].Addresses.map((a) => ({
    ref: a.DeliveryCity || a.Ref,
    name: a.Present || a.MainDescription,
  }));
}

/**
 * Get warehouses (branches) for city
 */
export async function getWarehouses(cityRef: string, limit = 100) {
  const result = await npApiRequest<Array<{ Ref: string; Description: string; ShortAddress: string }>>(
    "AddressGeneral",
    "getWarehouses",
    { CityRef: cityRef, Limit: String(limit), Page: "1" }
  );

  if (!result.success || !result.data) {
    return [];
  }

  return result.data.map((w) => ({
    ref: w.Ref,
    name: w.Description,
    address: w.ShortAddress || w.Description,
  }));
}

/**
 * Create Express Waybill (TTN)
 */
export async function createExpressWaybill(params: {
  senderRef: string;
  senderCityRef: string;
  senderWarehouseRef: string;
  recipientName: string;
  recipientPhone: string;
  recipientCityRef: string;
  recipientWarehouseRef: string;
  paymentMethod: "Cash" | "NonCash";
  cost: number; // in UAH
  weight: number; // in kg
  seatsAmount: number;
  description: string;
  cargoType?: string;
}) {
  const senderRef = params.senderRef || process.env.NP_SENDER_REF;
  if (!senderRef) {
    throw new Error("NP_SENDER_REF not configured");
  }

  const result = await npApiRequest<Array<{ Ref: string; IntDocNumber: string; CostOnSite: string }>>(
    "InternetDocument",
    "save",
    {
      PayerType: "Recipient",
      PaymentMethod: params.paymentMethod,
      DateTime: new Date().toISOString().split("T")[0], // YYYY-MM-DD
      CargoType: params.cargoType || "Parcel",
      Weight: String(params.weight),
      ServiceType: "WarehouseWarehouse",
      SeatsAmount: String(params.seatsAmount),
      Description: params.description,
      Cost: String(params.cost),
      CitySender: params.senderCityRef,
      Sender: senderRef,
      SenderAddress: params.senderWarehouseRef,
      ContactSender: senderRef,
      SendersPhone: process.env.NP_SENDER_PHONE || "",
      RecipientCityName: params.recipientCityRef,
      RecipientArea: "",
      RecipientAreaRegions: "",
      RecipientAddressName: params.recipientWarehouseRef,
      RecipientHouse: "",
      RecipientFlat: "",
      RecipientName: params.recipientName,
      RecipientType: "PrivatePerson",
      RecipientsPhone: params.recipientPhone,
    }
  );

  if (!result.success || !result.data?.[0]) {
    throw new Error(result.errors?.[0] || "Failed to create TTN");
  }

  return {
    ref: result.data[0].Ref,
    trackingNumber: result.data[0].IntDocNumber,
    cost: parseFloat(result.data[0].CostOnSite || "0"),
  };
}

/**
 * Track parcel by TTN
 */
export async function trackParcel(trackingNumber: string) {
  const result = await npApiRequest<Array<{
    Number: string;
    Status: string;
    StatusCode: string;
    WarehouseRecipient: string;
    WarehouseRecipientNumber: string;
    WarehouseRecipientAddress: string;
    CityRecipient: string;
    RecipientDateTime: string;
    ScheduledDeliveryDate: string;
  }>>(
    "TrackingDocument",
    "getStatusDocuments",
    { Documents: [{ DocumentNumber: trackingNumber }] }
  );

  if (!result.success || !result.data?.[0]) {
    return null;
  }

  const data = result.data[0];
  return {
    trackingNumber: data.Number,
    status: data.Status,
    statusCode: data.StatusCode,
    warehouse: data.WarehouseRecipient,
    warehouseNumber: data.WarehouseRecipientNumber,
    warehouseAddress: data.WarehouseRecipientAddress,
    city: data.CityRecipient,
    receivedAt: data.RecipientDateTime,
    scheduledDelivery: data.ScheduledDeliveryDate,
  };
}

/**
 * Delete TTN (if not yet processed)
 */
export async function deleteExpressWaybill(ref: string) {
  const result = await npApiRequest<Array<{ Ref: string }>>(
    "InternetDocument",
    "delete",
    { DocumentRefs: ref }
  );

  return result.success;
}

/**
 * Get delivery cost estimate
 */
export async function getDeliveryCost(params: {
  citySenderRef: string;
  cityRecipientRef: string;
  weight: number;
  cost: number;
  seatsAmount?: number;
}) {
  const result = await npApiRequest<Array<{ Cost: string }>>(
    "InternetDocument",
    "getDocumentPrice",
    {
      CitySender: params.citySenderRef,
      CityRecipient: params.cityRecipientRef,
      Weight: String(params.weight),
      ServiceType: "WarehouseWarehouse",
      Cost: String(params.cost),
      CargoType: "Parcel",
      SeatsAmount: String(params.seatsAmount || 1),
    }
  );

  if (!result.success || !result.data?.[0]) {
    return null;
  }

  return parseFloat(result.data[0].Cost);
}

/**
 * Get delivery time estimate
 */
export async function getDeliveryTime(params: {
  citySenderRef: string;
  cityRecipientRef: string;
}) {
  const result = await npApiRequest<Array<{ date: string }>>(
    "InternetDocument",
    "getDocumentDeliveryDate",
    {
      CitySender: params.citySenderRef,
      CityRecipient: params.cityRecipientRef,
      ServiceType: "WarehouseWarehouse",
      DateTime: new Date().toISOString().split("T")[0],
    }
  );

  if (!result.success || !result.data?.[0]) {
    return null;
  }

  return result.data[0].date;
}

/**
 * Map order status to Nova Poshta status
 */
export function mapOrderStatusToNpStatus(orderStatus: string): string | null {
  const mapping: Record<string, string> = {
    CONFIRMED: "101", // Очікується відправлення
    PROCESSING: "101",
    SHIPPED: "2", // Видалено
    DELIVERED: "9", // Отримано
    CANCELLED: "102", // Відмова
  };

  return mapping[orderStatus] || null;
}

/**
 * Parse Nova Poshta status code to human-readable text
 */
export function parseNpStatus(statusCode: string): string {
  const statuses: Record<string, string> = {
    "1": "Нова пошта очікує надходження від відправника",
    "2": "Видалено",
    "3": "У дорозі",
    "4": "Прибув у відділення",
    "5": "Неуспішна спроба доставки",
    "6": "Зберігається у відділенні",
    "7": "Повернення відправнику",
    "8": "Відправлено у місто одержувача",
    "9": "Отримано",
    "10": "Створено",
    "11": "Очікує відправлення",
    "101": "Очікується відправлення",
    "102": "Відмова одержувача",
    "103": "Відмова одержувача (інше)",
    "104": "Змінено адресу",
    "105": "Припинено зберігання",
    "106": "Одержано і створено ЄН зворотньої доставки",
  };

  return statuses[statusCode] || `Статус ${statusCode}`;
}
