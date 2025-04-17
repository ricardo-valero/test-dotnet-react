namespace backend.Models;
public class Todo
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public string? Description { get; set; }
    public required string Status { get; set; } // TODO: Make an enum
    public DateTime ExpiredAt { get; set; }
}