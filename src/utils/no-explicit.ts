const response = async (message: string) => {
  const res = await fetch("https://vector.profanity.dev", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  return res.json();
};

const isProfane = async (message: string): Promise<boolean> => {
  const result = await response(message);
  return result.score > 0.82;
};

export { reponse, isProfane }
