import { useCallback, useEffect, useMemo, useState } from "react";

const retrieveData = async () => {
  const raw = await fetch("http://localhost:8000/figma-data", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await raw.json();

  if (raw.ok) {
    return data;
  } else {
    return "Error";
  }
};

const App = () => {
  const [data, setData] = useState<any>(null);

  const request = useCallback(async () => {
    var response = undefined;

    try {
      response = await retrieveData();
      setData(response);
    } catch (err: any) {
      setData(undefined);
    }

    return response;
  }, []);

  useEffect(() => {
    if (!data) {
      request();
    }
  }, [data]);

  const display = useMemo(() => {
    return (
      data &&
      data.components.map((d: any) => {
        return (
          <div key={d.name} className={d.name} style={d.styles}>
            {d.name}
          </div>
        );
      })
    );
  }, [data]);

  return (
    <div style={{ backgroundColor: "white", height: "100vh" }}>
      {display && display.map((d: any) => <>{d}</>)}
    </div>
  );
};

export default App;
