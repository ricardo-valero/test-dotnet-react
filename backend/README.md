```bash
dotnet new web
dotnet new tool-manifest
dotnet tool install dotnet-aspnet-codegenerator
dotnet tool install dotnet-ef
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package Microsoft.VisualStudio.Web.CodeGeneration.Design
dotnet add package Microsoft.EntityFrameworkCore.Sqlite
dotnet add package Microsoft.EntityFrameworkCore.Tools
```


```bash
dotnet ef migrations add Initial
 > dotnet ef database update 
```