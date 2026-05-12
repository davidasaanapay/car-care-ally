import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1989 + 2 }, (_, i) => String(CURRENT_YEAR + 1 - i));

export const VEHICLE_MAKES: Record<string, string[]> = {
  Acura: ["ILX", "MDX", "RDX", "TLX", "Integra", "Other"],
  Audi: ["A3", "A4", "A6", "Q3", "Q5", "Q7", "Other"],
  BMW: ["2 Series", "3 Series", "5 Series", "X1", "X3", "X5", "Other"],
  Buick: ["Enclave", "Encore", "Envision", "Other"],
  Cadillac: ["CT4", "CT5", "Escalade", "XT4", "XT5", "XT6", "Other"],
  Chevrolet: ["Camaro", "Colorado", "Corvette", "Equinox", "Malibu", "Silverado", "Suburban", "Tahoe", "Traverse", "Trax", "Other"],
  Chrysler: ["300", "Pacifica", "Other"],
  Dodge: ["Challenger", "Charger", "Durango", "Other"],
  Ford: ["Bronco", "Edge", "Escape", "Expedition", "Explorer", "F-150", "F-250", "Maverick", "Mustang", "Ranger", "Other"],
  GMC: ["Acadia", "Canyon", "Sierra", "Terrain", "Yukon", "Other"],
  Honda: ["Accord", "Civic", "CR-V", "HR-V", "Odyssey", "Passport", "Pilot", "Ridgeline", "Other"],
  Hyundai: ["Elantra", "Kona", "Palisade", "Santa Fe", "Sonata", "Tucson", "Other"],
  Jeep: ["Cherokee", "Compass", "Gladiator", "Grand Cherokee", "Renegade", "Wrangler", "Other"],
  Kia: ["Forte", "Optima", "Seltos", "Sorento", "Soul", "Sportage", "Telluride", "Other"],
  Lexus: ["ES", "GX", "IS", "NX", "RX", "Other"],
  Lincoln: ["Aviator", "Corsair", "Nautilus", "Navigator", "Other"],
  Mazda: ["CX-30", "CX-5", "CX-9", "Mazda3", "Mazda6", "MX-5 Miata", "Other"],
  "Mercedes-Benz": ["A-Class", "C-Class", "E-Class", "GLA", "GLC", "GLE", "Other"],
  Nissan: ["Altima", "Frontier", "Maxima", "Murano", "Pathfinder", "Rogue", "Sentra", "Titan", "Versa", "Other"],
  Ram: ["1500", "2500", "3500", "Other"],
  Subaru: ["Ascent", "Crosstrek", "Forester", "Impreza", "Legacy", "Outback", "WRX", "Other"],
  Tesla: ["Model 3", "Model S", "Model X", "Model Y", "Cybertruck", "Other"],
  Toyota: ["4Runner", "Camry", "Corolla", "Highlander", "RAV4", "Sequoia", "Sienna", "Tacoma", "Tundra", "Other"],
  Volkswagen: ["Atlas", "Golf", "Jetta", "Passat", "Taos", "Tiguan", "Other"],
  Volvo: ["S60", "S90", "XC40", "XC60", "XC90", "Other"],
  Other: ["Other"],
};

export type VehicleSelection = { year: string; make: string; model: string };

export function VehicleSelect({
  value,
  onChange,
  size = "default",
}: {
  value: VehicleSelection;
  onChange: (v: VehicleSelection) => void;
  size?: "default" | "sm";
}) {
  const makes = Object.keys(VEHICLE_MAKES);
  const models = value.make ? VEHICLE_MAKES[value.make] ?? ["Other"] : [];
  const triggerCls = size === "sm" ? "h-9" : "";

  return (
    <div className="grid sm:grid-cols-3 gap-3">
      <Field label="Year">
        <Select value={value.year} onValueChange={(year) => onChange({ ...value, year })}>
          <SelectTrigger className={triggerCls}><SelectValue placeholder="Year" /></SelectTrigger>
          <SelectContent>{YEARS.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
        </Select>
      </Field>
      <Field label="Make">
        <Select value={value.make} onValueChange={(make) => onChange({ ...value, make, model: "" })}>
          <SelectTrigger className={triggerCls}><SelectValue placeholder="Make" /></SelectTrigger>
          <SelectContent>{makes.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
        </Select>
      </Field>
      <Field label="Model">
        <Select value={value.model} onValueChange={(model) => onChange({ ...value, model })} disabled={!value.make}>
          <SelectTrigger className={triggerCls}><SelectValue placeholder={value.make ? "Model" : "Pick make first"} /></SelectTrigger>
          <SelectContent>{models.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
        </Select>
      </Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
