import announcement from "./capabilities/announcement";
import ban from "./capabilities/ban";
import invite from "./capabilities/invite";
import logscanning from "./capabilities/logscanning";
import owneronly from "./capabilities/owneronly";
import searchuser from "./capabilities/searchuser";

export const capabilities = [
  ban,
  owneronly,
  announcement,
  invite,
  searchuser,
  logscanning,
];
