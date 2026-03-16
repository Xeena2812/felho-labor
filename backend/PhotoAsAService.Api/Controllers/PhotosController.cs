using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PhotoAsAService.Api.DTOs;
using PhotoAsAService.Api.Services;

namespace PhotoAsAService.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PhotosController(IPhotoService photoService) : ControllerBase
{
	[HttpGet]
	public ActionResult GetAll([FromQuery] string sortBy = "date", [FromQuery] bool descending = true)
	{
		var photos = photoService.GetAll(sortBy, descending);
		return Ok(photos);
	}

	[HttpGet("{id:int}")]
	public ActionResult GetById(int id)
	{
		var photo = photoService.GetById(id);
		if (photo is null)
		{
			return NotFound();
		}

		return Ok(photo);
	}

	[Authorize]
	[HttpPost]
	public ActionResult Create([FromBody] CreatePhotoDto request)
	{
		var validationError = ValidateName(request.Name);
		if (validationError is not null)
		{
			return BadRequest(validationError);
		}

		var created = photoService.Create(request.Name.Trim(), request.ImageUrl);
		return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
	}

	[Authorize]
	[HttpDelete("{id:int}")]
	public ActionResult Delete(int id)
	{
		var deleted = photoService.Delete(id);
		return deleted ? NoContent() : NotFound();
	}

	private static string? ValidateName(string? name)
	{
		if (string.IsNullOrWhiteSpace(name))
		{
			return "Name is required.";
		}

		if (name.Trim().Length > 40)
		{
			return "Name must be at most 40 characters.";
		}

		return null;
	}
}
