import type { NextConfig } from "next";
import { withChroma } from "chromadb";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withChroma(nextConfig);