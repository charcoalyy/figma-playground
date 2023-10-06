var express = require("express");
var cors = require("cors");
const app = express();
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const figmaURL = "https://api.figma.com/v1/files/JyI71wV0nuGZl04DhemRz8";
const figmaKey = "REPLACE";
const PORT = 8000;

const parseColours = (figmaColor, type) => {
  // may be either fills.color (for text) or backgroundColor (for container)
  const color = figmaColor;
  const rgba = `rgba(${color.r * 255}, ${color.g.toFixed(2)}, ${
    color.b * 255
  }, ${color.a * 255})`;
  if (type === "text") {
    return {
      color: rgba,
    };
  } else {
    return {
      backgroundColor: rgba,
    };
  }
};

const parseTextStyles = (figmaTextStyle) => {
  const style = figmaTextStyle;
  return style;
};

const parseFlex = (figmaFlexChild) => {
  const child = figmaFlexChild;
  return {
    display: "flex",
    flexDirection: child.layoutMode === "HORIZONTAL" ? "row" : "column",
    justifyContent: child.primaryAxisAlignItems?.toLowerCase(),
    alignItems: child.counterAxisAlignItems?.toLowerCase(),
    gap: child.itemSpacing,
    padding: `${child.paddingTop ?? 0}px ${child.paddingLeft ?? 0}px`,
    borderRadius: child.cornerRadius,
  };
};

app.use(cors());

app.get("/figma-data", async (_req, res) => {
  const headers = {
    "Content-Type": "application/json",
    "X-FIGMA-TOKEN": figmaKey,
  };

  console.log("attempting to access figma API");

  const raw = await fetch(figmaURL, {
    method: "GET",
    headers: headers,
  });

  const data = await raw.json();

  const response = {
    components: data.document.children
      .find((page) => page.name === "components")
      .children.map((comp) => {
        switch (comp.type) {
          case "COMPONENT_SET":
            return {
              name: comp.name,
            };
          case "COMPONENT":
          default:
            return {
              name: comp.name,
              styles: {
                ...parseFlex(comp),
                ...parseColours(comp.backgroundColor),
              },
              children: [
                comp.children.forEach((child) => {
                  return {
                    name: child.name,
                    styles: {
                      ...parseColours(child.fills[0].color),
                    },
                  };
                }),
              ],
            };
        }
      }),
  };

  if (data) {
    console.log("data received");
    res.set("Content-Type", "application/json");
    res.status(200).send(response);
  } else {
    console.log("well fuck");
    res.status(500).send("internal error");
  }
});

app.listen(PORT, () => console.log("server on port 8000"));
