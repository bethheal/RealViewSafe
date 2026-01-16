import api from "./api";
import { mockProperties } from "../mock/properties.mock";

export const getPropertiesApi = () =>
  api.get("/buyer/browse-properties");

export const getPropertiesMock = async () => mockProperties;
