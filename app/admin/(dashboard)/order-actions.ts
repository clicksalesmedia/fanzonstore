"use server";

import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function updateOrderStatus(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !(status in OrderStatus)) {
    throw new Error("Invalid order or status");
  }

  await prisma.order.update({
    where: { id },
    data: { status: status as OrderStatus },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}
