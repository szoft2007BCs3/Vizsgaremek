namespace KertmesterAPI.Models
{
    public class Rendeles
    {
        public int Id { get; set; }
        public string? Szallitasi_Cim { get; set; }
        public string? Statusz {  get; set; }
        public double Vegosszeg {  get; set; }
        public DateTime Rendeles_Datuma { get; set; }
        public int Kertterv_ID { get; set; }
        public Kertterv? Kertterv { get; set; }
    }
}
