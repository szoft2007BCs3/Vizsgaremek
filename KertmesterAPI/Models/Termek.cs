namespace KertmesterAPI.Models
{
    public class Termek
    {
        public int Id { get; set; }
        public string? Nev { get; set; }
        public string? Leiras { get; set; }
        public double Ar {  get; set; }
        public int Keszleten_Levo_Mennyiseg {  get; set; }
        public string? Meret_Adatok {  get; set; }
        public int Kategoria_ID { get; set; }
        public Kategoria? Kategoria { get; set; }
    }
}
