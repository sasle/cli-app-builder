import shell from "shelljs";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const RESET = "\x1b[0m";

export default function generateReactApp(projectPath) {
  console.log("Generating React app with TypeScript support...");

  const reactInstallProcess = shell.exec(
    `npx create-next-app@latest ${projectPath}/client --typescript --eslint --tailwind --no-src-dir --app --import-alias @`,
    { stdio: "inherit", silent: true }
  );

  if (reactInstallProcess.code === 0) {
    shell.cd(`${projectPath}/client`);

    // Create a "lib" folder if it doesn't exist
    if (!shell.test("-d", "lib")) {
      shell.mkdir("lib");
    }
    shell.exec(
      "npm install axios@latest devextreme@latest devextreme-react@latest --save --save-exact",
      {
        stdio: "inherit",
        silent: true,
      }
    );

    // Create and configure axios.ts in the "lib" folder
    const axiosConfig = `
          import axios from 'axios';
          
          const api = axios.create({
            baseURL: 'http://localhost:3333', // Replace with your API URL
          });
          
          export default api;
          `;

    shell.ShellString(axiosConfig).to("lib/axios.ts");

    // Change the contents of page.tsx
    const pageContents = `
      "use client";
      import api from "../lib/axios";
      import { DataGrid } from "devextreme-react";
      import "devextreme/dist/css/dx.light.css";
      import CustomStore from "devextreme/data/custom_store";
      import { useEffect, useState } from "react";
      import { Column } from "devextreme-react/data-grid";
      
      export default function Home() {
        const [store, setStore] = useState<CustomStore>(new CustomStore());
        const [selectedButton, setSelectedButton] = useState<string>("companies");
      
        useEffect(() => {
          setStore(
            new CustomStore({
              key: "id",
              async load(loadOptions) {
                const { data } = await api.get("/" + selectedButton); // not using string interpol because of tilde errors on CLI script.
                return data;
              },
              async insert(values) {
                await api.post("/" + selectedButton, values);
              },
              async update(key, values) {
                await api.put("/" + selectedButton + "/" + key, values);
              },
              async remove(key) {
                await api.delete("/" + selectedButton + "/" + key);
              },
            })
          );
        }, [selectedButton]);
      
        return (
          <div
            style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
          >
            <div
              style={{
                flex: "0.1",
                display: "flex",
                justifyContent: "center",
                gap: 30,
              }}
            >
              <button onClick={() => setSelectedButton("professionals")}>
                Professionals
              </button>
              <button onClick={() => setSelectedButton("companies")}>
                Companies
              </button>
              <button onClick={() => setSelectedButton("products")}>Products</button>
            </div>
            <DataGrid
              dataSource={store}
              editing={{
                allowAdding: true,
                allowUpdating: true,
                allowDeleting: true,
              }}
            >
              <Column dataField="id" allowEditing={false} />
              <Column dataField="name" />
              {(selectedButton === "professionals" ||
                selectedButton === "products") && (
                <Column
                  dataType="number"
                  dataField={
                    selectedButton === "professionals"
                      ? "companyId"
                      : "professionalId"
                  }
                />
              )}
            </DataGrid>
          </div>
        );
      }
  `;

    // Navigate to the "app" folder and update the page.tsx file
    shell.cd("app");
    shell.ShellString(pageContents).to("page.tsx");

    shell.cd("..");
    console.log(`${GREEN}React app created.${RESET}`);
  } else {
    console.error(`${RED}Error creating React app.${RESET}`);
  }
}
