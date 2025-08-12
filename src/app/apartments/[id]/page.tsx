// src/app/apartments/[id]/page.tsx
import { notFound } from "next/navigation";
import ApartmentClient from "./ApartmentClient";
import { ApartmentType } from "@/lib/inventoryData";

const apartmentList: { id: string; type: ApartmentType }[] = [
  { id: "11", type: "Deluxe" }, { id: "21", type: "Deluxe" }, { id: "31", type: "Deluxe" },
  { id: "41", type: "Deluxe" }, { id: "51", type: "Deluxe" },
  { id: "12", type: "Luxury" }, { id: "22", type: "Luxury" }, { id: "32", type: "Luxury" },
  { id: "42", type: "Luxury" }, { id: "52", type: "Luxury" },
  { id: "13", type: "Superior" }, { id: "23", type: "Superior" }, { id: "33", type: "Superior" },
  { id: "43", type: "Superior" }, { id: "53", type: "Superior" },
  { id: "14", type: "Executive" }, { id: "24", type: "Executive" }, { id: "34", type: "Executive" },
  { id: "61", type: "Penthouse 1" }, { id: "62", type: "Penthouse 2" }, { id: "63", type: "Penthouse 3" },
];

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const apartment = apartmentList.find((a) => a.id === id);
  if (!apartment) notFound();

  return <ApartmentClient id={apartment.id} type={apartment.type} />;
}
