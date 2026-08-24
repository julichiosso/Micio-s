// app/api/keep-alive/route.ts
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await db.query.secciones.findFirst();
    
    return NextResponse.json({ 
      ok: true, 
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    console.error("Keep-alive falló:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}