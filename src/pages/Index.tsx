
import Layout from "@/components/Layout";
import { SessionProvider } from "@/context/SessionContext";

const Index = () => {
  return (
    <SessionProvider>
      <Layout />
    </SessionProvider>
  );
};

export default Index;
