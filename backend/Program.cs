using backend.Models;
using System.Reflection;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddOpenApiDocument();

var conString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDb>(options => options.UseSqlite(conString));
builder.Services.AddDatabaseDeveloperPageExceptionFilter();

builder.Services.AddCors();
builder.Services.AddAuthentication().AddJwtBearer();
builder.Services.AddAuthorization();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseOpenApi();
    app.UseSwaggerUi();
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/", () => "Hello World!");

var todoGroup = app.MapGroup("/todo");

todoGroup.MapGet("/", async (AppDb db) =>
    await db.Todos.ToListAsync());

todoGroup.MapGet("/complete", async (AppDb db) =>
    await db.Todos.Where(t => t.Status.Equals("Complete")).ToListAsync());

todoGroup.MapGet("/{id}", async (int id, AppDb db) =>
    await db.Todos.FindAsync(id)
        is Todo todo
            ? Results.Ok(todo)
            : Results.NotFound());

todoGroup.MapPost("/", async (Todo todo, AppDb db) =>
{
    db.Todos.Add(todo);
    await db.SaveChangesAsync();
    return Results.Created($"/todo/{todo.Id}", todo);
});

todoGroup.MapPut("/{id}", async (int id, Todo inputTodo, AppDb db) =>
{
    var todo = await db.Todos.FindAsync(id);
    if (todo is null) return Results.NotFound();
    foreach (PropertyInfo property in typeof(Todo).GetProperties())
    {
        if (property.CanWrite)
        {
            property.SetValue(todo, property.GetValue(inputTodo));
        }
    }
    // TODO: 
    await db.SaveChangesAsync();
    return Results.NoContent();
});

todoGroup.MapDelete("/{id}", async (int id, AppDb db) =>
{
    if (await db.Todos.FindAsync(id) is Todo todo)
    {
        db.Todos.Remove(todo);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }
    return Results.NotFound();
});

app.Run();