using Microsoft.EntityFrameworkCore;

namespace backend.Models;
class AppDb : DbContext
{
    public AppDb(DbContextOptions<AppDb> options)
        : base(options) { }

    public DbSet<Todo> Todos => Set<Todo>();
}