using KertmesterAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace KertmesterAPI.Database
{
    public class KertmesterContext : DbContext
    {
        public DbSet<Felhasznalo> Felhasznalo { get; set; }
        public DbSet<Kategoria> Kategoria { get; set; }
        public DbSet<Kertterv> Kertterv { get; set; }
        public DbSet<Kertterv_termek> Kertterv_Termek { get; set; }
        public DbSet<Rendeles> Rendeles { get; set; }
        public DbSet<Termek> Termek { get; set; }
        public KertmesterContext(DbContextOptions<KertmesterContext> options) : base(options)
        {
        }
    }
}
