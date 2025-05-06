
import Layout from "@/components/Layout";
import { SessionProvider } from "@/context/SessionContext";
import { CompareProvider } from "@/context/CompareContext";

const Index = () => {
  return (
    <SessionProvider>
      <CompareProvider>
        <Layout />
      </CompareProvider>
    </SessionProvider>
  );
};

export default Index;
