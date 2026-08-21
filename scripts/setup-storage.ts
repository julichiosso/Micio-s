import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  console.log("Buckets actuales:", buckets, "Error:", listError);

  if (!buckets?.some((b) => b.name === "productos")) {
    const { data, error } = await supabase.storage.createBucket("productos", {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
    });
    console.log("Resultado de crear bucket 'productos':", data, error);
  } else {
    console.log("El bucket 'productos' ya existe.");
  }
}

run().then(() => process.exit(0)).catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
