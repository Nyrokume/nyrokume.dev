export type IpGeoLookup = {
  country?: string;
  countryCode?: string;
  city?: string;
  region?: string;
  provider?: string;
  asn?: string;
  hostname?: string;
  hosting?: boolean;
};

export type CfGeoProperties = {
  country?: string;
  city?: string;
  region?: string;
  asn?: number;
  asOrganization?: string;
};

type IpApiResponse = {
  status?: string;
  country?: string;
  countryCode?: string;
  city?: string;
  regionName?: string;
  isp?: string;
  org?: string;
  as?: string;
  asname?: string;
  reverse?: string;
  hosting?: boolean;
};

const PRIVATE_IP =
  /^(?:127\.|10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.|::1|fc00:|fd)/i;

function isPrivateIp(ip: string): boolean {
  return PRIVATE_IP.test(ip.trim());
}

function parseAsnFromAsField(as: string | undefined): string | undefined {
  if (!as) return undefined;
  const match = as.match(/\bAS(\d+)\b/i);
  return match ? match[1] : undefined;
}

function countryNameFromCode(code: string, locale: "ru" | "en"): string {
  try {
    const display = new Intl.DisplayNames([locale === "en" ? "en" : "ru"], {
      type: "region",
    });
    return display.of(code.toUpperCase()) ?? code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
}

export function geoFromCf(
  cf: CfGeoProperties | undefined,
  locale: "ru" | "en" = "ru",
): IpGeoLookup | undefined {
  if (!cf) return undefined;

  const lookup: IpGeoLookup = {};

  if (cf.country) {
    lookup.countryCode = cf.country.toUpperCase();
    lookup.country = countryNameFromCode(cf.country, locale);
  }

  if (cf.city) lookup.city = cf.city;
  if (cf.region) lookup.region = cf.region;
  if (cf.asOrganization) lookup.provider = cf.asOrganization;
  if (typeof cf.asn === "number") lookup.asn = String(cf.asn);

  return Object.values(lookup).some(Boolean) ? lookup : undefined;
}

export async function lookupIpGeo(ip: string): Promise<IpGeoLookup | undefined> {
  const trimmed = ip.trim();
  if (!trimmed || isPrivateIp(trimmed)) {
    return undefined;
  }

  const fields = [
    "status",
    "country",
    "countryCode",
    "city",
    "regionName",
    "isp",
    "org",
    "as",
    "asname",
    "reverse",
    "hosting",
  ].join(",");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500);

  try {
    const response = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(trimmed)}?fields=${fields}`,
      { signal: controller.signal },
    );

    if (!response.ok) return undefined;

    const data = (await response.json()) as IpApiResponse;
    if (data.status !== "success") return undefined;

    const lookup: IpGeoLookup = {
      country: data.country?.trim(),
      countryCode: data.countryCode?.trim()?.toUpperCase(),
      city: data.city?.trim(),
      region: data.regionName?.trim(),
      provider: data.asname?.trim() || data.org?.trim() || data.isp?.trim(),
      asn: parseAsnFromAsField(data.as),
      hostname: data.reverse?.trim(),
      hosting: data.hosting,
    };

    return Object.values(lookup).some((value) => value !== undefined && value !== "")
      ? lookup
      : undefined;
  } catch {
    return undefined;
  } finally {
    clearTimeout(timeout);
  }
}

export function mergeIpGeo(
  primary: IpGeoLookup | undefined,
  fallback: IpGeoLookup | undefined,
): IpGeoLookup | undefined {
  if (!primary && !fallback) return undefined;
  if (!primary) return fallback;
  if (!fallback) return primary;

  return {
    country: primary.country ?? fallback.country,
    countryCode: primary.countryCode ?? fallback.countryCode,
    city: primary.city ?? fallback.city,
    region: primary.region ?? fallback.region,
    provider: primary.provider ?? fallback.provider,
    asn: primary.asn ?? fallback.asn,
    hostname: primary.hostname ?? fallback.hostname,
    hosting: primary.hosting ?? fallback.hosting,
  };
}

export async function resolveIpGeo(
  ip: string | undefined,
  cf: CfGeoProperties | undefined,
  locale: "ru" | "en" = "ru",
): Promise<IpGeoLookup | undefined> {
  const cfGeo = geoFromCf(cf, locale);
  if (!ip) return cfGeo;

  const apiGeo = await lookupIpGeo(ip);
  return mergeIpGeo(apiGeo, cfGeo);
}
