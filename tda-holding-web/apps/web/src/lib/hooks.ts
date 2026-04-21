import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "./api";

export interface Vehicle {
  id: number;
  name: string;
  slug: string;
  type: string;
  price_per_day?: number;
  price_sale?: number;
  city: string;
  description?: string;
  images?: Array<{ url: string }>;
  media?: Array<{ url: string }>;
}

export interface Property {
  id: number;
  name: string;
  slug: string;
  type: string;
  price?: number;
  city: string;
  description?: string;
  images?: Array<{ url: string }>;
  media?: Array<{ url: string }>;
}

export interface Driver {
  id: number;
  name: string;
  phone: string;
  experience_years?: number;
  is_available: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const data = await apiFetch<{ data: Vehicle[] }>("/api/v1/vehicles");
        setVehicles(data.data || []);
      } catch (err) {
        console.error("Failed to fetch vehicles:", err);
        setError(err instanceof ApiError ? err.message : "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  return { vehicles, loading, error };
}

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const data = await apiFetch<{ data: Property[] }>("/api/v1/properties");
        setProperties(data.data || []);
      } catch (err) {
        console.error("Failed to fetch properties:", err);
        setError(err instanceof ApiError ? err.message : "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  return { properties, loading, error };
}

export function useDrivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const data = await apiFetch<{ data: Driver[] }>("/api/v1/drivers");
        setDrivers(data.data || []);
      } catch (err) {
        console.error("Failed to fetch drivers:", err);
        setError(err instanceof ApiError ? err.message : "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  return { drivers, loading, error };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await apiFetch<{ data: Category[] }>("/api/v1/categories");
        setCategories(data.data || []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError(err instanceof ApiError ? err.message : "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
}

export function useVehicleBySlug(slug: string) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchVehicle = async () => {
      try {
        const data = await apiFetch<Vehicle>(`/api/v1/vehicles/${slug}`);
        setVehicle(data);
      } catch (err) {
        console.error("Failed to fetch vehicle:", err);
        setError(err instanceof ApiError ? err.message : "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [slug]);

  return { vehicle, loading, error };
}

export function usePropertyBySlug(slug: string) {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchProperty = async () => {
      try {
        const data = await apiFetch<Property>(`/api/v1/properties/${slug}`);
        setProperty(data);
      } catch (err) {
        console.error("Failed to fetch property:", err);
        setError(err instanceof ApiError ? err.message : "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [slug]);

  return { property, loading, error };
}

export interface Booking {
  id: number;
  type: "vehicle" | "property" | "driver";
  name: string;
  start_date: string;
  end_date?: string;
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
}

export function useUserBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await apiFetch<{ data: Booking[] }>("/api/v1/bookings");
        setBookings(data.data || []);
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
        setError(err instanceof ApiError ? err.message : "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  return { bookings, loading, error };
}
