import Script from "next/script";
const NewRelic: React.FC = () => {
  return (
    <>
      <Script id="new-relic-config" type="text/javascript">
        {`
                window.NREUM||(NREUM={});NREUM.init={distributed_tracing:{enabled:true},privacy:{cookies_enabled:true},ajax:{deny_list:["bam.nr-data.net"]}};
                NREUM.loader_config={accountID:"${process.env.NEXT_PUBLIC_NEW_RELIC_ACCOUNT_ID}",trustKey:"${process.env.NEXT_PUBLIC_NEW_RELIC_TRUST_KEY}",agentID:"${process.env.NEXT_PUBLIC_NEW_RELIC_AGENT_ID}",licenseKey:"${process.env.NEXT_PUBLIC_NEW_RELIC_LICENSE_KEY}",applicationID:"${process.env.NEXT_PUBLIC_NEW_RELIC_APPLICATION_ID}"};
                NREUM.info={beacon:"bam.nr-data.net",errorBeacon:"bam.nr-data.net",licenseKey:"${process.env.NEXT_PUBLIC_NEW_RELIC_LICENSE_KEY}",applicationID:"${process.env.NEXT_PUBLIC_NEW_RELIC_APPLICATION_ID}",sa:1};
            `}
      </Script>
      <Script
        id="new-relic-runtime"
        src="/scripts/new-relic-loader-spa-1.242.0.min.js"
        strategy="lazyOnload"
      ></Script>
    </>
  );
};

export default NewRelic;
