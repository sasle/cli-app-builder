import shell from "shelljs";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const RESET = "\x1b[0m";

export default function generateReactApp(framework, projectPath) {
  console.log(`Generating ${framework} app...`);

  if (framework === "React") {
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
  import { Column, Lookup, RequiredRule } from "devextreme-react/data-grid";
  
  export default function Home() {
    const [store, setStore] = useState<CustomStore>(new CustomStore());
    const [lookupSource, setLookupSource] = useState<CustomStore>(
      new CustomStore()
    );
    const [selectedButton, setSelectedButton] = useState<string>("companies");
  
    useEffect(() => {
      // Define the lookupTable based on the selectedButton
      const lookupTable =
        selectedButton === "professionals" ? "companies" : "professionals";
  
      setStore(
        new CustomStore({
          key: "id",
          async load(loadOptions) {
            const { data } = await api.get("/" + selectedButton);
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
  
      setLookupSource(
        new CustomStore({
          key: "id",
          async load(loadOptions) {
            const { data } = await api.get("/" + lookupTable); // Use lookupTable here
            return data;
          },
          async byKey(key, extraOptions) {
            const { data } = await api.get("/" + lookupTable + "/" + key); // Use lookupTable here
            return data;
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
          <Column dataField="name">
            <RequiredRule />
          </Column>
          {(selectedButton === "professionals" ||
            selectedButton === "products") && (
            <Column
              dataType="number"
              dataField={
                selectedButton === "professionals"
                  ? "companyId"
                  : "professionalId"
              }
              caption={
                selectedButton === "professionals" ? "Company" : "Professional"
              }
            >
              <RequiredRule />
              <Lookup
                dataSource={lookupSource}
                displayExpr={"name"}
                valueExpr={"id"}
              />
            </Column>
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
  } else {
    shell.cd(projectPath);
    const viteInstallProcess = shell.exec(
      `npm create vite@latest client -- --template react-ts`,
      {
        stdio: "inherit",
        silent: true,
      }
    );
    shell.cd(`${projectPath}/client`);

    shell.exec("npm install", {
      stdio: "inherit",
      silent: true,
    });

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
 import { Column, Lookup, RequiredRule } from "devextreme-react/data-grid";
 
 export default function Home() {
   const [store, setStore] = useState<CustomStore>(new CustomStore());
   const [lookupSource, setLookupSource] = useState<CustomStore>(
     new CustomStore()
   );
   const [selectedButton, setSelectedButton] = useState<string>("companies");
 
   useEffect(() => {
     // Define the lookupTable based on the selectedButton
     const lookupTable =
       selectedButton === "professionals" ? "companies" : "professionals";
 
     setStore(
       new CustomStore({
         key: "id",
         async load(loadOptions) {
           const { data } = await api.get("/" + selectedButton);
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
 
     setLookupSource(
       new CustomStore({
         key: "id",
         async load(loadOptions) {
           const { data } = await api.get("/" + lookupTable); // Use lookupTable here
           return data;
         },
         async byKey(key, extraOptions) {
           const { data } = await api.get("/" + lookupTable + "/" + key); // Use lookupTable here
           return data;
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
         <Column dataField="name">
           <RequiredRule />
         </Column>
         {(selectedButton === "professionals" ||
           selectedButton === "products") && (
           <Column
             dataType="number"
             dataField={
               selectedButton === "professionals"
                 ? "companyId"
                 : "professionalId"
             }
             caption={
               selectedButton === "professionals" ? "Company" : "Professional"
             }
           >
             <RequiredRule />
             <Lookup
               dataSource={lookupSource}
               displayExpr={"name"}
               valueExpr={"id"}
             />
           </Column>
         )}
       </DataGrid>
     </div>
   );
 }
 
   `;

    // Navigate to the "app" folder and update the page.tsx file
    shell.cd("src");
    shell.ShellString(pageContents).to("App.tsx");

    shell.cd("..");

    if (viteInstallProcess.code === 0) {
      console.log(`${GREEN}Vite app created.${RESET}`);
    } else {
      console.error(`${RED}Error creating Vite app.${RESET}`);
    }
  }
}
