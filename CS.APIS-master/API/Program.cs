using Core.Repositories.Contract;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Repository;
using Repository.Data;
using Project.APIS.Extensions;
using Project.APIS.MiddleWare;
using Repository.Data.Identity;
using Core.Entities.Identity;
using Microsoft.AspNetCore.Identity;
using Project.Repository.Data.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace API
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            // Add DbContexts
            builder.Services.AddDbContext<StoreContext>(options =>
            {
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
            });

            builder.Services.AddDbContext<AppIdentityDbContext>(options =>
            {
                options.UseSqlServer(builder.Configuration.GetConnectionString("IdentityConnection"));
            });

            // Add application services and identity
            builder.Services.AddApplicationServices();

            builder.Services.AddIdentity<AppUser, IdentityRole>(options =>
            {
                // You can add identity options here if needed
            }).AddEntityFrameworkStores<AppIdentityDbContext>();

            // Add JWT authentication
            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters()
                {
                    ValidateIssuer = true,
                    ValidIssuer = builder.Configuration["JWT:ValidIssure"],
                    ValidateAudience = true,
                    ValidAudience = builder.Configuration["JWT:ValidAudience"],
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(builder.Configuration["JWT:Authkey"] ?? string.Empty)
                    )
                };
            });

            // ✅ Add CORS policy
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAll", policy =>
                {
                    policy.AllowAnyOrigin()
                          .AllowAnyHeader()
                          .AllowAnyMethod();
                });
            });

            var app = builder.Build();

            // Update database at runtime
            using var scop = app.Services.CreateScope();
            var services = scop.ServiceProvider;
            var dbContext = services.GetRequiredService<StoreContext>();
            var identityDbContext = services.GetRequiredService<AppIdentityDbContext>();
            var userManager = services.GetRequiredService<UserManager<AppUser>>();
            var loggerFactory = services.GetRequiredService<ILoggerFactory>();

            try
            {
                await dbContext.Database.MigrateAsync();
                await identityDbContext.Database.MigrateAsync();
                await AppIdentityDbContextSeed.SeedUserAsync(userManager);
            }
            catch (Exception ex)
            {
                var logger = loggerFactory.CreateLogger<Program>();
                logger.LogError(ex, "An error occurred during migration");
            }

            // Use custom exception middleware
            app.UseMiddleware<ExcptionMiddleWare>();

            // Enable Swagger in development
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            // Global error page redirection
            app.UseStatusCodePagesWithReExecute("/Errors/{0}");

            // HTTPS redirect
            app.UseHttpsRedirection();

            // ✅ Enable CORS
            app.UseCors("AllowAll");

            // Authentication & Authorization
            app.UseAuthentication(); // Needed for JWT
            app.UseAuthorization();

            // Serve static files
            app.UseStaticFiles();

            // Map endpoints
            app.MapControllers();

            // Run the application
            app.Run();
        }
    }
}
