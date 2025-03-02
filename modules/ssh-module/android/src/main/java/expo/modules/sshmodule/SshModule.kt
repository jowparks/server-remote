package expo.modules.sshmodule

import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class TransferProgress(
  @Field
  val transferred: String,
  @Field
  val total: String
) : Record

class ConnectionDetails(
    val user: String,
    val password: String,
    val address: String
)

class SshModule : Module() {
  private var session: Session? = null
  private var connectionDetails: ConnectionDetails? = null

  private suspend fun reconnect(): Session {
      val details = connectionDetails ?: throw CodedException("Session is null")
      val currentSession = session
      return try {
          currentSession?.testConnection()
          currentSession ?: connect(details.user, details.password, details.address)
      } catch (e: Exception) {
          connect(details.user, details.password, details.address)
      }
  }

  private suspend fun connect(user: String, password: String, address: String) {
      session = connect(user, password, address)
      connectionDetails = ConnectionDetails(user, password, address)
  }

  override fun definition() = ModuleDefinition {
    Name("SshModule")

    Constants(
      mapOf("PI" to Math.PI)
    )

    Events("exec")

    Function("hello") {
      "Hello world! 👋"
    }

    AsyncFunction("connect") { user: String, password: String, address: String ->
      connect(user, password, address)
    }

    AsyncFunction("exec") { commandId: String, command: String, promise: Promise ->
      CoroutineScope(Dispatchers.IO).launch {
        try {
          val session = reconnect()
          session.exec(commandId, command) { output ->
            sendEvent("exec", mapOf("commandId" to commandId, "data" to output))
          }
          promise.resolve("Success")
        } catch (e: Exception) {
          promise.reject(CodedException(e))
        }
      }
    }

    AsyncFunction("cancel") { id: String, promise: Promise ->
      CoroutineScope(Dispatchers.IO).launch {
        try {
          val session = reconnect()
          session.cancel(id)
          promise.resolve("0")
        } catch (e: Exception) {
          promise.reject(CodedException(e))
        }
      }
    }

    AsyncFunction("transfer") { transferId: String, sourcePath: String, destinationPath: String, direction: String, promise: Promise ->
      CoroutineScope(Dispatchers.IO).launch {
        try {
          val session = reconnect()
          session.transfer(transferId, sourcePath, destinationPath, direction)
          promise.resolve("0")
        } catch (e: Exception) {
          promise.reject(CodedException(e))
        }
      }
    }

    AsyncFunction("transferProgress") { transferId: String, promise: Promise ->
      CoroutineScope(Dispatchers.IO).launch {
        try {
          val session = reconnect()
          val progress = session.transferProgress(transferId)
          promise.resolve(TransferProgress(progress.transferred.toString(), progress.total.toString()))
        } catch (e: Exception) {
          promise.reject(CodedException(e))
        }
      }
    }
  }
}
