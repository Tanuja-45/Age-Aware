export const getRulesForAge = (age: number) => {
  if (age <= 3) return { maxScreenTime: 30, bedtime: "8:00 PM" };
  if (age >=4 && age <= 6) return { maxScreenTime: 30, bedtime: "8:30 PM" };
  if (age >=7 && age <= 9) return { maxScreenTime: 30, bedtime: "9:00 PM" };
  if (age >=10 && age <= 12) return { maxScreenTime: 60, bedtime: "10:00 PM" };
  if (age >=13 && age <= 15) return { maxScreenTime: 90, bedtime: "10:30 PM" };
  return { maxScreenTime: 120, bedtime: "11:00 PM" };
};
