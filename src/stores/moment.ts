import { fetchLastMoment } from "@stayreal/api";
import { createResource } from "solid-js";

const [get, { refetch }] = createResource(fetchLastMoment);
export default { get, refetch };
