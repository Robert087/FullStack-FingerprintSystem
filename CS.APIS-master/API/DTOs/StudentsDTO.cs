using Core.Entities;

namespace API.DTOs
{
    public class StudentsDTO
    {
        public int ID { get; set; }
        public string St_Code { get; set; }
        public string St_NameAr { get; set; }
        public string St_NameEn { get; set; }
        public string St_Email { get; set; }
        public string St_Image { get; set; }
        public string Phone { get; set; }
        public int Fac_ID { get; set; }
        public string Faculty { get; set; }
        public int FacYearSem_ID { get; set; }
        public string FacultyYearSemister { get; set; } 
    }
}
