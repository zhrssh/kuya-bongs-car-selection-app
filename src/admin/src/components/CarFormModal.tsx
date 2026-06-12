import {
  CarBodyType,
  CarBodyTypeLabel,
  CarCondition,
  CarConditionLabel,
  CarFuelType,
  CarFuelTypeLabel,
  CarStatus,
  CarTransmission,
  CarTransmissionLabel,
} from "@repo/shared";
import { Sparkles, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { Spinner } from "@repo/shared";
import { Car, SellerContact } from "../types";

interface CarFormModalProps {
  isOpen: boolean;
  car: Car | null;
  sellers: SellerContact[];
  onAddCar: (car: Car) => void;
  onUpdateCar: (car: Car) => void;
  onClose: () => void;
  isSaving: boolean;
}

const defaultFormData: Partial<Car> = {
  make: "",
  model: "",
  year: 0,
  price: 0,
  mileage: 0,
  bodyType: CarBodyType.Sedan,
  fuelType: CarFuelType.Gasoline,
  transmission: CarTransmission.Automatic,
  condition: CarCondition.Excellent,
  exteriorColor: "",
  interiorColor: "",
  engine: "",
  drivetrain: "",
  features: "",
  description: "",
  imageUrl: "",
  status: CarStatus.Available,
  seller: {
    id: "",
    name: "",
    phone: "",
    email: "",
    location: "",
  },
};

const API_URL = import.meta.env.VITE_FLASK_APP_API_URL;

const isUploadedUrl = (url: string) =>
  url.startsWith(window.location.origin + "/public/images/");

export default function CarFormModal({
  isOpen,
  car,
  sellers,
  onAddCar,
  onUpdateCar,
  onClose,
  isSaving,
}: CarFormModalProps) {
  const [formData, setFormData] = useState<Partial<Car>>({});
  const [formError, setFormError] = useState("");
  const [imageInputUrl, setImageInputUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (car) {
        setFormData({ ...car });
      } else {
        setFormData({ ...defaultFormData });
      }
      setFormError("");
      setImageInputUrl("");
      setUploadedFiles([]);
    }
  }, [isOpen, car]);

  const deleteUploadedFile = async (url: string) => {
    if (!isUploadedUrl(url)) return;
    try {
      const filename = url.split("/").pop();
      const res = await fetch(`${API_URL}/api/uploads/${filename}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        alert("Failed to delete uploaded file.");
      }
    } catch (err) {
      alert("Failed to delete uploaded file. Please try again.");
    }
  };

  const uploadFiles = async (files: File[]): Promise<string[]> => {
    setIsUploading(true);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("files", f));

      const res = await fetch(`${API_URL}/api/uploads`, {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      const data = await res.json();
      if (data.status !== "success") {
        const msgs = data.errors
          ? Object.values(data.errors).join("; ")
          : "Upload failed";
        throw new Error(msgs);
      }
      return data.data.urls;
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = async () => {
    for (const url of uploadedFiles) {
      await deleteUploadedFile(url);
    }
    setUploadedFiles([]);
    onClose();
  };

  const handleFormSubmit = async (e: any) => {
    e.preventDefault();

    const {
      make,
      model,
      year,
      price,
      mileage,
      features,
      exteriorColor,
      description,
      condition,
      imageUrl,
    } = formData;

    if (
      !make ||
      !model ||
      !year ||
      !price ||
      !mileage ||
      !exteriorColor ||
      !description ||
      !imageUrl
    ) {
      setFormError(
        "Please fill out all required fields (Brand, Model, Year, Price, Mileage, Exterior, Description, and at least one image).",
      );
      return;
    }

    const readyCar: Car = {
      ...(formData as Car),
      id: car ? car.id : "",
      year: Number(year),
      price: Number(price),
      mileage: Number(mileage),
      features: features,
      condition: condition || CarCondition.Excellent,
      status: formData.status || CarStatus.Available,
      images:
        formData.images && formData.images.length > 0
          ? formData.images
          : formData.imageUrl
            ? [formData.imageUrl]
            : [],
      seller: {
        ...(formData.seller as SellerContact),
        id: (formData.seller as SellerContact).id || "",
      },
      sellerId: formData.seller?.id || "",
    };

    if (car) {
      await onUpdateCar(readyCar);
    } else {
      delete readyCar.id;
      await onAddCar(readyCar);
    }

    setUploadedFiles([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-zinc-200 text-zinc-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl p-6 relative flex flex-col justify-between space-y-6">
        {/* Form Header */}
        <div>
          <h3 className="text-lg font-bold text-zinc-900 font-sans tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-zinc-650" />
            {car
              ? "Update Car Listing CMS"
              : "Register New Vehicle in Stock"}
          </h3>
          <p className="text-xs text-zinc-450 mt-1">
            Fill in critical catalog fields to populate filters and
            real-time statistics charts
          </p>
        </div>

        {/* Form Fields body */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-mono">
              {formError}
            </div>
          )}
          {/* Brand and Model row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-550">
                Brand / Make *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Porsche, Tesla"
                value={formData.make || ""}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, make: e.target.value }))
                }
                className="w-full bg-zinc-50 border border-zinc-200 rounded px-3 py-2 text-sm text-zinc-800 placeholder-zinc-450 focus:outline-none focus:ring-1 focus:ring-zinc-300 focus:border-zinc-300 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-550">
                Model *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Taycan, 911"
                value={formData.model || ""}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, model: e.target.value }))
                }
                className="w-full bg-zinc-50 border border-zinc-200 rounded px-3 py-2 text-sm text-zinc-800 placeholder-zinc-455 focus:outline-none focus:ring-1 focus:ring-zinc-300 focus:border-zinc-300 font-mono"
              />
            </div>
          </div>{" "}
          {/* Year, Price, Mileage */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-550">
                Year *
              </label>
              <input
                type="number"
                required
                placeholder="2022"
                value={formData.year || ""}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    year: Number(e.target.value),
                  }))
                }
                className="w-full bg-zinc-50 border border-zinc-200 rounded px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:border-zinc-300"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-550">
                Price (₱ PHP) *
              </label>
              <input
                type="number"
                required
                step={1000}
                placeholder="35000"
                value={formData.price || ""}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    price: Number(e.target.value),
                  }))
                }
                className="w-full bg-zinc-50 border border-zinc-200 rounded px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:border-zinc-300 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-550">
                Mileage (km) *
              </label>
              <input
                type="number"
                required
                step={1000}
                placeholder="12000"
                value={formData.mileage || ""}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    mileage: Number(e.target.value),
                  }))
                }
                className="w-full bg-zinc-50 border border-zinc-200 rounded px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:border-zinc-300 font-mono"
              />
            </div>
          </div>
          {/* Categorization elements */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500">
                Body Type
              </label>
              <select
                value={formData.bodyType || CarBodyType.Sedan}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    bodyType: e.target.value as any,
                  }))
                }
                className="w-full bg-zinc-50 border border-zinc-200 rounded px-3 py-2 text-sm text-zinc-800 focus:outline-none">
                <option value={CarBodyType.Sedan}>
                  {CarBodyTypeLabel[CarBodyType.Sedan]}
                </option>
                <option value={CarBodyType.SUV}>
                  {CarBodyTypeLabel[CarBodyType.SUV]}
                </option>
                <option value={CarBodyType.Coupe}>
                  {CarBodyTypeLabel[CarBodyType.Coupe]}
                </option>
                <option value={CarBodyType.Truck}>
                  {CarBodyTypeLabel[CarBodyType.Truck]}
                </option>
                <option value={CarBodyType.Hatchback}>
                  {CarBodyTypeLabel[CarBodyType.Hatchback]}
                </option>
                <option value={CarBodyType.Convertible}>
                  {CarBodyTypeLabel[CarBodyType.Convertible]}
                </option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500">
                Fuel Type
              </label>
              <select
                value={formData.fuelType || CarFuelType.Gasoline}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    fuelType: e.target.value as any,
                  }))
                }
                className="w-full bg-zinc-50 border border-zinc-200 rounded px-3 py-2 text-sm text-zinc-800 focus:outline-none">
                <option value={CarFuelType.Gasoline}>
                  {CarFuelTypeLabel[CarFuelType.Gasoline]}
                </option>
                <option value={CarFuelType.Electric}>
                  {CarFuelTypeLabel[CarFuelType.Electric]}
                </option>
                <option value={CarFuelType.Hybrid}>
                  {CarFuelTypeLabel[CarFuelType.Hybrid]}
                </option>
                <option value={CarFuelType.Diesel}>
                  {CarFuelTypeLabel[CarFuelType.Diesel]}
                </option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500">
                Transmission
              </label>
              <select
                value={formData.transmission || CarTransmission.Automatic}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    transmission: e.target.value as any,
                  }))
                }
                className="w-full bg-zinc-50 border border-zinc-200 rounded px-3 py-2 text-sm text-zinc-800 focus:outline-none">
                <option value={CarTransmission.Automatic}>
                  {CarTransmissionLabel[CarTransmission.Automatic]}
                </option>
                <option value={CarTransmission.Manual}>
                  {CarTransmissionLabel[CarTransmission.Manual]}
                </option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500">
                Condition
              </label>
              <select
                value={formData.condition || CarCondition.Excellent}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    condition: e.target.value as any,
                  }))
                }
                className="w-full bg-zinc-50 border border-zinc-205 rounded px-3 py-2 text-sm text-zinc-800 font-semibold focus:outline-none">
                <option value={CarCondition.Excellent}>
                  {CarConditionLabel[CarCondition.Excellent]}
                </option>
                <option value={CarCondition.VeryGood}>
                  {CarConditionLabel[CarCondition.VeryGood]}
                </option>
                <option value={CarCondition.Good}>
                  {CarConditionLabel[CarCondition.Good]}
                </option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-blue-600 font-mono">
                Status
              </label>
              <select
                value={formData.status || CarStatus.Available}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    status: e.target.value as any,
                  }))
                }
                className="w-full bg-zinc-50 border border-zinc-200 rounded px-3 py-2 text-sm text-zinc-800 font-semibold focus:outline-none focus:border-blue-300">
                <option value={CarStatus.Available}>Available</option>
                <option value={CarStatus.Sold}>Sold</option>
                <option value={CarStatus.Archived}>Archived</option>
              </select>
            </div>
          </div>
          {/* Mechanical specs colors */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-550">
                Exterior Color *
              </label>
              <input
                type="text"
                required
                placeholder="Chalk Red"
                value={formData.exteriorColor || ""}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    exteriorColor: e.target.value,
                  }))
                }
                className="w-full bg-zinc-50 border border-zinc-200 rounded px-3 py-2 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-300"
              />
            </div>{" "}
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-550">
                Interior Color
              </label>
              <input
                type="text"
                placeholder="Black Leather"
                value={formData.interiorColor || ""}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    interiorColor: e.target.value,
                  }))
                }
                className="w-full bg-zinc-50 border border-zinc-200 rounded px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:border-zinc-300 placeholder-zinc-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-550">
                Engine Block
              </label>
              <input
                type="text"
                placeholder="3.0L Flat-6"
                value={formData.engine || ""}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, engine: e.target.value }))
                }
                className="w-full bg-zinc-50 border border-zinc-200 rounded px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:border-zinc-300 placeholder-zinc-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-550">
                Drivetrain
              </label>
              <input
                type="text"
                placeholder="AWD"
                value={formData.drivetrain || ""}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, drivetrain: e.target.value }))
                }
                className="w-full bg-zinc-50 border border-zinc-200 rounded px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:border-zinc-300 placeholder-zinc-400"
              />
            </div>
            {/* Media URL / Upload Image section */}
            <div className="space-y-3 border border-slate-200 rounded-xl p-4 bg-slate-50/50 col-span-4">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-zinc-700 block">
                  Vehicle Media Image Gallery *
                </label>
                {formData.imageUrl && (
                  <button
                    type="button"
                    onClick={async () => {
                      for (const url of formData.images || []) {
                        await deleteUploadedFile(url);
                      }
                      setFormData((p) => ({
                        ...p,
                        imageUrl: "",
                        images: [],
                      }));
                      setUploadedFiles([]);
                    }}
                    className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer">
                    Reset All Images
                  </button>
                )}
              </div>

              {/* Drag and Drop Zone / File upload */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const files = Array.from(e.dataTransfer.files).filter(
                    (f) => f.type.startsWith("image/"),
                  );
                  if (files.length === 0) return;
                  try {
                    const urls = await uploadFiles(files);
                    setFormData((p) => {
                      const currentImages =
                        p.images && p.images.length > 0
                          ? [...p.images]
                          : p.imageUrl
                            ? [p.imageUrl]
                            : [];
                      const newImages = [...currentImages, ...urls];
                      return {
                        ...p,
                        images: newImages,
                        imageUrl: p.imageUrl || newImages[0],
                      };
                    });
                    setUploadedFiles((prev) => [...prev, ...urls]);
                  } catch (err: any) {
                    alert(err.message || "Upload failed. Please try again.");
                  }
                }}
                className="border-2 border-dashed border-slate-300 hover:border-blue-400 bg-white rounded-xl p-5 text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-all relative overflow-hidden">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []).filter(
                      (f) => f.type.startsWith("image/"),
                    );
                    if (files.length === 0) return;
                    try {
                      const urls = await uploadFiles(files);
                      setFormData((p) => {
                        const currentImages =
                          p.images && p.images.length > 0
                            ? [...p.images]
                            : p.imageUrl
                              ? [p.imageUrl]
                              : [];
                        const newImages = [...currentImages, ...urls];
                        return {
                          ...p,
                          images: newImages,
                          imageUrl: p.imageUrl || newImages[0],
                        };
                      });
                      setUploadedFiles((prev) => [...prev, ...urls]);
                    } catch (err: any) {
                      alert(err.message || "Upload failed. Please try again.");
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  title="Choose image files"
                />

                {isUploading ? (
                  <Spinner label="Uploading images..." />
                ) : (
                  <>
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-full border border-blue-105">
                      <Upload className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-blue-600 hover:underline">
                        Click to upload files
                      </span>
                      <span className="text-xs text-zinc-500">
                        {" "}
                        or drag and drop images
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400">
                      Multiple image uploads supported (PNG, JPG, WebP)
                    </span>
                  </>
                )}
              </div>

              {/* Direct text input option */}
              <div className="space-y-1.5 mt-2">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider font-mono block">
                  Add Image by Direct URL:
                </span>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="e.g. https://images.unsplash.com/photo-..."
                    value={imageInputUrl}
                    onChange={(e) => setImageInputUrl(e.target.value)}
                    className="flex-1 bg-white border border-zinc-200 rounded px-3 py-1.5 text-xs text-zinc-850 placeholder-zinc-400 focus:outline-none focus:border-zinc-300 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!imageInputUrl) return;
                      setFormData((p) => {
                        const currentImages =
                          p.images && p.images.length > 0
                            ? [...p.images]
                            : p.imageUrl
                              ? [p.imageUrl]
                              : [];
                        const newImages = [...currentImages, imageInputUrl];
                        return {
                          ...p,
                          images: newImages,
                          imageUrl: p.imageUrl ? p.imageUrl : newImages[0],
                        };
                      });
                      setImageInputUrl("");
                    }}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-xs font-semibold cursor-pointer whitespace-nowrap">
                    Add URL
                  </button>
                </div>
              </div>

              {/* Images list manager */}
              {(() => {
                const items =
                  formData.images && formData.images.length > 0
                    ? formData.images
                    : formData.imageUrl
                      ? [formData.imageUrl]
                      : [];
                if (items.length === 0) return null;

                return (
                  <div className="space-y-2 mt-3 pt-3 border-t border-zinc-200/60">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block font-mono">
                      Loaded Images Gallery ({items.length})
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {items.map((url, index) => {
                        const isMain = formData.imageUrl === url;
                        return (
                          <div
                            key={index}
                            className={`relative group/thumb border rounded-xl overflow-hidden aspect-video bg-zinc-50 flex items-center justify-center transition-all ${
                              isMain
                                ? "border-blue-600 ring-2 ring-blue-500/20"
                                : "border-zinc-200 hover:border-zinc-350"
                            }`}>
                            <img
                              src={url}
                              alt={`car-thumb-${index}`}
                              className="w-full h-full object-cover"
                            />

                            {/* Overlay actions */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1">
                              {!isMain && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFormData((p) => ({
                                      ...p,
                                      imageUrl: url,
                                    }))
                                  }
                                  className="bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-bold px-2 py-1 rounded cursor-pointer w-full text-center">
                                  Set Main
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={async () => {
                                  const deletingUrl = items[index];
                                  await deleteUploadedFile(deletingUrl);
                                  setFormData((p) => {
                                    const filtered = items.filter(
                                      (_, idx) => idx !== index,
                                    );
                                    let nextMain = p.imageUrl;
                                    if (isMain) {
                                      nextMain =
                                        filtered.length > 0
                                          ? filtered[0]
                                          : "";
                                    }
                                    return {
                                      ...p,
                                      images: filtered,
                                      imageUrl: nextMain,
                                    };
                                  });
                                  setUploadedFiles((prev) =>
                                    prev.filter((u) => u !== deletingUrl),
                                  );
                                }}
                                className="bg-rose-600 hover:bg-rose-500 text-white text-[9px] font-bold px-2 py-1 rounded cursor-pointer w-full text-center">
                                Delete
                              </button>
                            </div>

                            {/* Main image label indicator */}
                            {isMain && (
                              <span className="absolute top-1 left-1 bg-blue-600 text-white text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded shadow-xs font-mono">
                                Main
                              </span>
                            )}

                            {/* Item index */}
                            <span className="absolute bottom-1 right-1 bg-black/50 text-white text-[8px] font-bold px-1 rounded">
                              {index + 1}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>{" "}
          </div>
          {/* Key Features input comma list */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-550">
              Key Features
            </label>
            <input
              type="text"
              placeholder="Autopilot, Panoramic Roof, Heated Steering Wheel"
              value={formData.features || ""}
              onChange={(e) =>
                setFormData((p) => ({ ...p, features: e.target.value }))
              }
              className="w-full bg-zinc-50 border border-zinc-200 rounded px-3 py-2 text-sm text-zinc-805 placeholder-zinc-400 focus:outline-none focus:border-zinc-300"
            />
          </div>
          {/* Listing description */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-550">
              Overview Description *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Detail outstanding advantages, ownership health, battery capacity, dent details..."
              value={formData.description || ""}
              onChange={(e) =>
                setFormData((p) => ({ ...p, description: e.target.value }))
              }
              className="w-full bg-zinc-50 border border-zinc-200 rounded px-3 py-2 text-sm font-sans text-zinc-805 placeholder-zinc-400 focus:outline-none focus:border-zinc-300"
            />
          </div>
          {/* Seller details group toggleable or static */}
          <div className="border border-zinc-200 p-4 rounded-lg bg-zinc-50 space-y-3">
            <h5 className="text-[10px] uppercase tracking-wider font-semibold text-zinc-450 font-mono">
              Seller Assignment
            </h5>
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-400 font-semibold block font-mono">
                Select Assigned Agent *
              </span>
              <select
                value={formData.seller?.name || ""}
                onChange={(e) => {
                  const selectedName = e.target.value;
                  const selectedSeller = sellers.find(
                    (s) => s.name === selectedName,
                  );
                  if (selectedSeller) {
                    setFormData((p) => ({
                      ...p,
                      seller: { ...selectedSeller },
                    }));
                  } else {
                    setFormData((p) => ({
                      ...p,
                      seller: undefined,
                    }));
                  }
                }}
                required
                className="w-full bg-white border border-zinc-200 rounded px-2.5 py-1.5 text-xs text-zinc-805 placeholder-zinc-400 focus:outline-none focus:border-zinc-350 cursor-pointer"
                id="select_seller_assignment">
                <option value="">-- Choose Agent from Directory --</option>
                {sellers.map((s, idx) => (
                  <option key={idx} value={s.name}>
                    {s.name} ({s.location} - {s.status || "Active"})
                  </option>
                ))}
              </select>
            </div>

            {formData.seller && formData.seller.name && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 bg-white/40 p-2.5 rounded border border-zinc-205/65">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-zinc-400 font-mono block">
                    Station/Office
                  </span>
                  <span className="text-xs font-semibold text-zinc-700">
                    {formData.seller.location}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-zinc-400 font-mono block">
                    Contact Phone
                  </span>
                  <span className="text-xs font-semibold text-zinc-700 font-mono">
                    {formData.seller.phone}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-zinc-400 font-mono block">
                    Sales Email
                  </span>
                  <span className="text-xs font-semibold text-zinc-700 line-clamp-1">
                    {formData.seller.email}
                  </span>
                </div>
              </div>
            )}
          </div>
          {/* Control Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-150">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 border border-zinc-205/50 rounded-lg text-xs text-zinc-700 font-semibold cursor-pointer transition font-sans"
              id="form_btn_cancel">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition font-sans inline-flex items-center gap-2"
              id="form_btn_submit">
              {isSaving ? (
                <>
                  <Spinner size="sm" />
                  <span>{car ? "Saving..." : "Publishing..."}</span>
                </>
              ) : (
                car ? "Save Changes" : "Publish Listing"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
