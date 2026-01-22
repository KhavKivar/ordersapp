import API_BASE_URL from "@/config/api";

export const deleteOrder = async (orderId: number) => {
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Error eliminando pedido");
  }

  return res.json();
};
