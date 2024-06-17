export const sendData = async (allCanvasData, docId, clientData) => {
  const mergedData = { data: allCanvasData, clientData, docId: docId };

  try {
    const response = await fetch(
      "https://allkits-server.onrender.com/sendEmail",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mergedData),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to send data");
    }

    const responseData = await response.text();
  } catch (error) {
    console.error("Error:", error);
  }
};
