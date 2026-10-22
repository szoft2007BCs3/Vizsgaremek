namespace KertmesterAPI.Models
{
    public class Felhasznalo
    {
        public int Id { get; set; }
        public string? Nev { get; set; }
        public string? Email { get; set; }
        public string? Jelszo { get; set; }
        public string? Telefonszam { get; set; }
        public DateTime Regisztracio_Datuma { get; set; }
    }
}
