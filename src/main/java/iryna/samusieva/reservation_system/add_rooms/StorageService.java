package iryna.samusieva.reservation_system.add_rooms;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

@Service
public class StorageService {

    private final S3Client s3Client;

    @Value("${cloudflare.r2.bucket-name}")
    private String bucketName;

    public StorageService(S3Client s3Client) {
        this.s3Client = s3Client;
    }

    public String uploadFile(MultipartFile file) throws IOException {
        // Генерируем уникальное имя файла, чтобы избежать совпадений
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();

        PutObjectRequest objectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(fileName)
                .contentType(file.getContentType())
                .build();

        s3Client.putObject(objectRequest, RequestBody.fromInputStream(
                file.getInputStream(),
                file.getSize()
        ));
        return "https://pub-b80ae22be51d442f91a5edc3c685d0af.r2.dev/" + fileName;
    }
}
