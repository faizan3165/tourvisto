import { useState } from "react";
import { useNavigate } from "react-router";
import { ComboBoxComponent } from "@syncfusion/ej2-react-dropdowns";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import {
  LayerDirective,
  LayersDirective,
  MapsComponent,
} from "@syncfusion/ej2-react-maps";

import type { Route } from "./+types/create-trip";

import { Header } from "components";

import { cn, formatKey } from "lib/utils";
import { account } from "~/appwrite/client";
import { comboBoxItems, selectItems } from "~/constants";
import { world_map } from "~/constants/world_map";

export const loader = async () => {
  const response = await fetch("https://restcountries.com/v3.1/all");
  const data = await response.json();

  return data.map((country: any) => ({
    name: country.flag + country.name.common,
    coordinates: country.latlng,
    value: country.name.common,
    openStreetMap: country.maps?.openStreetMap,
  }));
};

const CreateTrip = ({ loaderData }: Route.ComponentProps) => {
  const navigate = useNavigate();
  const countries = loaderData as Country[];

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<TripFormData>({
    country: countries[0]?.name || "",
    travelStyle: "",
    interest: "",
    budget: "",
    groupType: "",
    duration: 0,
  });

  const countryData = countries.map((country) => ({
    text: country.name,
    value: country.value,
  }));

  const mapData = [
    {
      country: formData.country,
      color: "#EA382E",
      coordinates:
        countries.find((country) => country.name === formData.country)
          ?.coordinates || [],
    },
  ];

  const handleChange = async (
    key: keyof TripFormData,
    value: string | number
  ) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (
      !formData.country ||
      !formData.travelStyle ||
      !formData.interest ||
      !formData.budget ||
      !formData.groupType ||
      !formData.duration
    ) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    if (formData.duration < 1 || formData.duration > 10) {
      setError("Duration must be between 1 and 10 days.");
      setLoading(false);
      return;
    }

    const user = await account.get();

    if (!user?.$id) {
      console.log("User not authenticated");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/create-trip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          country: formData.country,
          travelStyle: formData.travelStyle,
          interests: formData.interest,
          budget: formData.budget,
          groupType: formData.groupType,
          numberOfDays: formData.duration,
          userId: user.$id,
        }),
      });

      const result: CreateTripResponse = await response.json();

      if (result?.id) navigate(`/trips/${result.id}`);
      else console.error("Failed to generate trip:", result);
    } catch (error) {
      console.error("Error creating trip:", error);
      setError("An error occurred while creating the trip.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col gap-10 pb-20 wrapper">
      <Header
        title="Add A New Trip"
        description="View and Edit AI Generated Travel Plans"
      />

      <section className="mt-2.5 wrapper-md">
        <form className="trip-form" onSubmit={handleSubmit}>
          {/* country dropdown */}
          <div>
            <label htmlFor="country">Country</label>

            <ComboBoxComponent
              id="country"
              dataSource={countryData}
              fields={{ text: "text", value: "value" }}
              placeholder="Select a Country"
              className="combo-box"
              allowFiltering
              change={(e: { value: string | undefined }) => {
                if (e.value) {
                  handleChange("country", e.value);
                }
              }}
              filtering={(e) => {
                const query = e.text.toLowerCase();

                e.updateData(
                  countries
                    .filter((country) =>
                      country.name.toLowerCase().includes(query)
                    )
                    .map((country) => ({
                      text: country.name,
                      value: country.value,
                    }))
                );
              }}
            />
          </div>

          {/* duration field */}
          <div>
            <label htmlFor="duration">Duration</label>

            <input
              type="number"
              id="duration"
              name="duration"
              placeholder="Enter number of days e.g. (5,7...)"
              className="form-input placeholder:text-gray-100"
              onChange={(e) => handleChange("duration", Number(e.target.value))}
            />
          </div>

          {/* different dropdowns */}
          {selectItems.map((key) => (
            <div key={key}>
              <label htmlFor={key}>{formatKey(key)}</label>

              <ComboBoxComponent
                id={key}
                dataSource={comboBoxItems[key].map((item) => ({
                  text: item,
                  value: item,
                }))}
                fields={{ text: "text", value: "value" }}
                className="combo-box"
                placeholder={`Select a ${formatKey(key)}`}
                allowFiltering
                change={(e: { value: string | undefined }) => {
                  if (e.value) {
                    handleChange(key, e.value);
                  }
                }}
                filtering={(e) => {
                  const query = e.text.toLowerCase();

                  e.updateData(
                    comboBoxItems[key]
                      .filter((item) => item.toLowerCase().includes(query))
                      .map((item) => ({
                        text: item,
                        value: item,
                      }))
                  );
                }}
              />
            </div>
          ))}

          {/* map */}
          <div>
            <label htmlFor="location">Location On The World Map</label>

            <MapsComponent>
              <LayersDirective>
                <LayerDirective
                  shapeData={world_map}
                  dataSource={mapData}
                  shapePropertyPath="name"
                  shapeDataPath="country"
                  shapeSettings={{
                    colorValuePath: "color",
                    fill: "#E5E5E5",
                  }}
                />
              </LayersDirective>
            </MapsComponent>
          </div>

          {/* divider */}
          <div className="bg-gray-200 h-px w-full" />

          {/* errors */}
          {error && (
            <div className="error">
              <p>{error}</p>
            </div>
          )}

          {/* form button */}
          <footer className="px-6 w-full">
            <ButtonComponent
              type="submit"
              className="button-class !h-12 !w-full"
              disabled={loading}
            >
              <img
                src={`/assets/icons/${
                  loading ? "loader.svg" : "magic-star.svg"
                }`}
                alt="button-img"
                className={cn("size-5", { "animate-spin": loading })}
              />

              <span className="p-16-semibold text-white">
                {loading ? "Generating..." : "Generate Trip"}
              </span>
            </ButtonComponent>
          </footer>
        </form>
      </section>
    </main>
  );
};

export default CreateTrip;
