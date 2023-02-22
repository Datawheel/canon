{
  "compileOnSave": true,
  "compilerOptions": {
    "target": "ES2020",
    "module": "esnext",
    "jsx": "react-jsx",
    "moduleResolution": "node",
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "removeComments": false,
    "preserveConstEnums": true,
    "noErrorTruncation": true,
    "sourceMap": true,
    "strict": false,
    "strictNullChecks": true,
    "resolveJsonModule": true,
    "baseUrl": ".",
    "types": ["node"],
    "typeRoots": ["./node_modules/@types/", "**/typings/**/*.d.ts"],
    "lib": ["dom", "es2015", "es2016", "es2019.object"],
    "esModuleInterop": true,
    "declaration": true,
    "composite": true,
    "declarationMap": true,
    "outDir": "./dist"
  },
  "exclude": ["**/node_modules", "**/dist"]
}
