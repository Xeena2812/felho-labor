namespace PhotoAsAService.Api.DTOs;

public class CreatePhotoDto
{
	public string Name { get; set; } = string.Empty;
	public string? ImageUrl { get; set; }
}
