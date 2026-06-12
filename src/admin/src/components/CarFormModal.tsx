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
  Select,
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
    <div className="fixed inset-0 bg-bg-dark/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-bg-surface border border-border text-text-body rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl p-6 relative flex flex-col justify-between space-y-6">
        {/* Form Header */}
        <div>
          <h3 className="text-lg font-bold text-text-strong font-sans tracking-tight flex items-center gap-2">
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
            <div className="p-3 bg-danger-bg border border-danger-border text-danger-text rounded-lg text-xs font-mono">
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
                className="w-full bg-bg-raised border border-border rounded px-3 py-2 text-sm text-text-body placeholder-zinc-450 focus:outline-none focus:ring-1 focus:ring-border-hover focus:border-border-hover font-mono"
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
                className="w-full bg-bg-raised border border-border rounded px-3 py-2 text-sm text-text-body placeholder-zinc-455 focus:outline-none focus:ring-1 focus:ring-border-hover focus:border-border-hover font-mono"
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
                className="w-full bg-bg-raised border border-border rounded px-3 py-2 text-sm text-text-body focus:outline-none focus:border-border-hover"
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
                className="w-full bg-bg-raised border border-border rounded px-3 py-2 text-sm text-text-body focus:outline-none focus:border-border-hover font-mono"
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
                className="w-full bg-bg-raised border border-border rounded px-3 py-2 text-sm text-text-body focus:outline-none focus:border-border-hover font-mono"
              />
            </div>
          </div>
          {/* Categorization elements */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-muted">
                Body Type
              </label>
              <Select
                value={formData.bodyType || CarBodyType.Sedan}
                options={[
                  { value: CarBodyType.Sedan, label: CarBodyTypeLabel[CarBodyType.Sedan] },
                  { value: CarBodyType.SUV, label: CarBodyTypeLabel[CarBodyType.SUV] },
                  { value: CarBodyType.Coupe, label: CarBodyTypeLabel[CarBodyType.Coupe] },
                  { value: CarBodyType.Truck, label: CarBodyTypeLabel[CarBodyType.Truck] },
                  { value: CarBodyType.Hatchback, label: CarBodyTypeLabel[CarBodyType.Hatchback] },
                  { value: CarBodyType.Convertible, label: CarBodyTypeLabel[CarBodyType.Convertible] },
                ]}
                onChange={(v) => setFormData((p) => ({ ...p, bodyType: v as any }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-text-muted">
                Fuel Type
              </label>
              <Select
                value={formData.fuelType || CarFuelType.Gasoline}
                options={[
                  { value: CarFuelType.Gasoline, label: CarFuelTypeLabel[CarFuelType.Gasoline] },
                  { value: CarFuelType.Electric, label: CarFuelTypeLabel[CarFuelType.Electric] },
                  { value: CarFuelType.Hybrid, label: CarFuelTypeLabel[CarFuelType.Hybrid] },
                  { value: CarFuelType.Diesel, label: CarFuelTypeLabel[CarFuelType.Diesel] },
                ]}
                onChange={(v) => setFormData((p) => ({ ...p, fuelType: v as any }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-text-muted">
                Transmission
              </label>
              <Select
                value={formData.transmission || CarTransmission.Automatic}
                options={[
                  { value: CarTransmission.Automatic, label: CarTransmissionLabel[CarTransmission.Automatic] },
                  { value: CarTransmission.Manual, label: CarTransmissionLabel[CarTransmission.Manual] },
                ]}
                onChange={(v) => setFormData((p) => ({ ...p, transmission: v as any }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-text-muted">
                Condition
              </label>
              <Select
                value={formData.condition || CarCondition.Excellent}
                options={[
                  { value: CarCondition.Excellent, label: CarConditionLabel[CarCondition.Excellent] },
                  { value: CarCondition.VeryGood, label: CarConditionLabel[CarCondition.VeryGood] },
                  { value: CarCondition.Good, label: CarConditionLabel[CarCondition.Good] },
                ]}
                onChange={(v) => setFormData((p) => ({ ...p, condition: v as any }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-brand font-mono">
                Status
              </label>
              <Select
                value={formData.status || CarStatus.Available}
                options={[
                  { value: CarStatus.Available, label: "Available" },
                  { value: CarStatus.Sold, label: "Sold" },
                  { value: CarStatus.Archived, label: "Archived" },
                ]}
                onChange={(v) => setFormData((p) => ({ ...p, status: v as any }))}
              />
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
                className="w-full bg-bg-raised border border-border rounded px-3 py-2 text-sm text-text-body placeholder-text-faint focus:outline-none focus:border-border-hover"
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
                className="w-full bg-bg-raised border border-border rounded px-3 py-2 text-sm text-text-body focus:outline-none focus:border-border-hover placeholder-text-faint"
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
                className="w-full bg-bg-raised border border-border rounded px-3 py-2 text-sm text-text-body focus:outline-none focus:border-border-hover placeholder-text-faint"
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
                className="w-full bg-bg-raised border border-border rounded px-3 py-2 text-sm text-text-body focus:outline-none focus:border-border-hover placeholder-text-faint"
              />
            </div>
            {/* Media URL / Upload Image section */}
            <div className="space-y-3 border border-border rounded-xl p-4 bg-bg-raised/50 col-span-4">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-text-secondary-hover block">
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
                    className="text-[10px] font-bold text-danger hover:underline cursor-pointer">
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
                className="border-2 border-dashed border-border-hover hover:border-brand bg-bg-surface rounded-xl p-5 text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-all relative overflow-hidden">
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
                    <div className="p-2.5 bg-brand/10 text-brand rounded-full border border-brand/10">
                      <Upload className="w-5 h-5 text-brand" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-brand hover:underline">
                        Click to upload files
                      </span>
                      <span className="text-xs text-text-muted">
                        {" "}
                        or drag and drop images
                      </span>
                    </div>
                    <span className="text-[10px] text-text-faint">
                      Multiple image uploads supported (PNG, JPG, WebP)
                    </span>
                  </>
                )}
              </div>

              {/* Direct text input option */}
              <div className="space-y-1.5 mt-2">
                <span className="text-[10px] font-semibold text-text-faint uppercase tracking-wider font-mono block">
                  Add Image by Direct URL:
                </span>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="e.g. https://images.unsplash.com/photo-..."
                    value={imageInputUrl}
                    onChange={(e) => setImageInputUrl(e.target.value)}
                    className="flex-1 bg-bg-surface border border-border rounded px-3 py-1.5 text-xs text-zinc-850 placeholder-text-faint focus:outline-none focus:border-border-hover font-mono"
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
                  <div className="space-y-2 mt-3 pt-3 border-t border-border/60">
                    <span className="text-[10px] font-bold text-text-faint uppercase tracking-wider block font-mono">
                      Loaded Images Gallery ({items.length})
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {items.map((url, index) => {
                        const isMain = formData.imageUrl === url;
                        return (
                          <div
                            key={index}
                            className={`relative group/thumb border rounded-xl overflow-hidden aspect-video bg-bg-raised flex items-center justify-center transition-all ${
                              isMain
                                ? "border-brand ring-2 ring-brand/20"
                                : "border-border hover:border-border-hover"
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
                                  className="bg-brand hover:bg-brand-dark text-text-on-brand text-[9px] font-bold px-2 py-1 rounded cursor-pointer w-full text-center">
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
                                className="bg-danger hover:bg-danger text-text-on-brand text-[9px] font-bold px-2 py-1 rounded cursor-pointer w-full text-center">
                                Delete
                              </button>
                            </div>

                            {/* Main image label indicator */}
                            {isMain && (
                              <span className="absolute top-1 left-1 bg-brand text-text-on-brand text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded shadow-xs font-mono">
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
              className="w-full bg-bg-raised border border-border rounded px-3 py-2 text-sm text-zinc-805 placeholder-text-faint focus:outline-none focus:border-border-hover"
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
              className="w-full bg-bg-raised border border-border rounded px-3 py-2 text-sm font-sans text-zinc-805 placeholder-text-faint focus:outline-none focus:border-border-hover"
            />
          </div>
          {/* Seller details group toggleable or static */}
          <div className="border border-border p-4 rounded-lg bg-bg-raised space-y-3">
            <h5 className="text-[10px] uppercase tracking-wider font-semibold text-zinc-450 font-mono">
              Seller Assignment
            </h5>
            <div className="space-y-1">
              <span className="text-[10px] text-text-faint font-semibold block font-mono">
                Select Assigned Agent *
              </span>
              <Select
                value={formData.seller?.name || ""}
                options={sellers.map((s) => ({
                  value: s.name,
                  label: `${s.name} (${s.location} - ${s.status || "Active"})`,
                }))}
                onChange={(selectedName) => {
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
                placeholder="-- Choose Agent from Directory --"
                id="select_seller_assignment"
              />
            </div>

            {formData.seller && formData.seller.name && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 bg-bg-surface/40 p-2.5 rounded border border-zinc-205/65">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-text-faint font-mono block">
                    Station/Office
                  </span>
                  <span className="text-xs font-semibold text-text-secondary-hover">
                    {formData.seller.location}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-text-faint font-mono block">
                    Contact Phone
                  </span>
                  <span className="text-xs font-semibold text-text-secondary-hover font-mono">
                    {formData.seller.phone}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-text-faint font-mono block">
                    Sales Email
                  </span>
                  <span className="text-xs font-semibold text-text-secondary-hover line-clamp-1">
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
              className="px-4 py-2 bg-bg-muted hover:bg-bg-hover border border-zinc-205/50 rounded-lg text-xs text-text-secondary-hover font-semibold cursor-pointer transition font-sans"
              id="form_btn_cancel">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-brand hover:bg-brand-dark disabled:opacity-50 text-text-on-brand rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition font-sans inline-flex items-center gap-2"
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
