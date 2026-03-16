namespace PhotoAsAService.Api.Models;

public class Photo
{
	public int Id { get; set; }
	public string Name { get; set; } = string.Empty;
	public DateTime UploadedAt { get; set; }
	public string ImageUrl { get; set; } = "/photo.jpg";
}
