namespace KertmesterAPI.Models
{
    public class Kertterv
    {
        public int Id { get; set; }
        public string? Nev { get; set; }
        public string? Kertterv_kep { get; set; }
        public DateTime Letrehozas_Datuma {  get; set; }
        public DateTime Utolso_Modosítás {  get; set; }
        public double Kert_Hosszusaga { get; set; }
        public double Kert_Szelessege {  get; set; }
        public int Felhasznalo_ID { get; set; }
        public Felhasznalo? Felhasznalo { get; set; }
    }
}
