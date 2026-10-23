"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminCookie, checkAdminCredentials, createAdminSession, sessionLifetime } from "@/lib/admin-auth";

export async function loginAdmin(previousState, formData) {
  const username = formData.get("username");
  const password = formData.get("password");
  if (typeof username !== "string" || typeof password !== "string" ||
      !username || !password || username.length > 200 || password.length > 200) {
    return { error: "Add meg a felhasználónevet és a jelszót (legfeljebb 200 karakter)." };
  }
  let session;
  try {
    if (!checkAdminCredentials(username, password)) {
      return { error: "Hibás felhasználónév vagy jelszó." };
    }
    session = createAdminSession();
  } catch (error) {
    console.error("Admin login failed.", { message: error.message });
    return { error: "A bejelentkezés jelenleg nem elérhető. Ellenőrizd a szerver adminbeállításait." };
  }
  cookies().set(adminCookie, session, {
    httpOnly: true, secure: process.env.NODE_ENV === "production",
    sameSite: "lax", path: "/admin", maxAge: sessionLifetime,
  });
  redirect("/admin");
}

export async function logoutAdmin() {
  cookies().set(adminCookie, "", {
    httpOnly: true, secure: process.env.NODE_ENV === "production",
    sameSite: "lax", path: "/admin", maxAge: 0,
  });
  redirect("/admin");
}
