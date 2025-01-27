export const formatToYen = (amount: number): string => {
    const yen = Math.round(amount);
    const oku = Math.floor(yen / 1_0000_0000);
    const man = Math.floor((yen % 1_0000_0000) / 1_0000);
    return `${oku > 0 ? `${oku}億` : ""}${man}万円`;
  };