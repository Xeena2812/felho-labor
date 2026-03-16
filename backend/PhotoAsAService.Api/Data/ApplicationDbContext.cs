using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PhotoAsAService.Api.Models;

namespace PhotoAsAService.Api.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
	: IdentityDbContext<IdentityUser>(options)
{
	public DbSet<Photo> Photos => Set<Photo>();
}
