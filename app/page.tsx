import { CarrierSalesDashboard } from "@/components/CarrierSalesDashboard";
import { getMetricsSummary } from "@/lib/metrics";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { summary, source } = await getMetricsSummary();

  return (
    <CarrierSalesDashboard
      fmcsaConfigured={Boolean(process.env.FMCSA_API_KEY)}
      source={source}
      summary={summary}
    />
  );
}
